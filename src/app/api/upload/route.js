import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";
import { uploadLimiter } from "@/libs/rate-limit";
import { getS3ClientConfig, getBucketName, getAwsCredentials } from "@/libs/aws-config";
import uniqid from 'uniqid';

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Please sign in to upload videos." }, { status: 401 });
    }

    // Rate limit by user email
    const { success: rateLimitOk, resetIn } = uploadLimiter(session.user.email);
    if (!rateLimitOk) {
      return Response.json(
        { error: "Too many uploads. Please wait a moment." },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    // Check usage limits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    // Admin users bypass limits — respect either the `plan === 'admin'` set by auth.js
    // via ADMIN_EMAILS env var OR the explicit `isAdmin` flag on the User row
    const isAdmin = user.plan === 'admin' || user.isAdmin === true;
    if (!isAdmin && user.videosUsed >= user.videosLimit) {
      return Response.json(
        { error: "You've reached your monthly video limit. Please upgrade your plan." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: "No file provided." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: "Invalid file type. Please upload a video file." }, { status: 400 });
    }

    // Validate file size (500MB max)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json({ error: "File too large. Maximum size is 500MB." }, { status: 400 });
    }

    const { name, type } = file;
    const data = await file.arrayBuffer();

    // Fail fast with a clear message if server env vars aren't set
    const creds = getAwsCredentials();
    const bucket = getBucketName();
    if (!creds.accessKeyId || !creds.secretAccessKey) {
      return Response.json(
        { error: "Server misconfigured: AWS credentials are not set. Check Netlify env vars (AWS_ACCESS_KEY1 + AWS_SECRET_ACCESS_KEY1)." },
        { status: 500 }
      );
    }
    if (!bucket) {
      return Response.json(
        { error: "Server misconfigured: BUCKET_NAME env var is not set." },
        { status: 500 }
      );
    }

    const s3client = new S3Client(getS3ClientConfig());

    const id = uniqid();
    const rawExt = name.split('.').slice(-1)[0]?.toLowerCase();
    const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
    const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : 'mp4';
    const newName = id + '.' + ext;

    // NOTE: no ACL — the bucket has "Block all public access" enabled, and passing
    // ACL: 'public-read' would make S3 reject the PUT with AccessControlListNotSupported.
    // Videos are served to the client via presigned GET URLs (see /api/video-url).
    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Body: Buffer.from(data),
      ContentType: type,
      Key: newName,
    });

    await s3client.send(uploadCommand);

    // Increment usage counter and track video
    await prisma.user.update({
      where: { id: user.id },
      data: { videosUsed: { increment: 1 } },
    });

    await prisma.video.create({
      data: {
        userId: user.id,
        filename: newName,
        originalName: name,
        status: 'uploaded',
      },
    });

    // Only return what the client needs — filename for the editor route
    return Response.json({ name: newName, ext, newName });
  } catch (error) {
    console.error('Upload error:', error);
    // Surface AWS / Prisma error codes to the client so debugging is possible in prod
    const detail =
      error?.name === 'AccessControlListNotSupported'
        ? 'Storage bucket rejected the upload (bucket has Block Public Access enabled). Contact support.'
        : error?.name === 'NoSuchBucket'
        ? 'Storage bucket not found. Check BUCKET_NAME env var.'
        : error?.name === 'InvalidAccessKeyId' || error?.name === 'SignatureDoesNotMatch'
        ? 'Invalid AWS credentials. Check server env vars.'
        : error?.message || 'Unknown error';
    return Response.json(
      { error: `Upload failed: ${detail}` },
      { status: 500 }
    );
  }
}
