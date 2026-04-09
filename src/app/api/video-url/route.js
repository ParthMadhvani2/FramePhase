import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";

/**
 * Returns a short-lived presigned GET URL for a video stored in our private
 * S3 bucket. The bucket has "Block all public access" enabled, so clients
 * can't reach files directly — this endpoint gates access to authenticated
 * users who own the video.
 *
 * Usage: GET /api/video-url?filename=<newName>
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");

  if (!filename || !/^[a-zA-Z0-9_.-]+$/.test(filename)) {
    return Response.json({ error: "Invalid filename" }, { status: 400 });
  }

  // Make sure the caller owns this video (or is admin)
  const video = await prisma.video.findFirst({
    where: { filename },
    select: { userId: true },
  });
  if (!video) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

  const isAdmin = session.user.isAdmin || session.user.plan === "admin";
  if (video.userId !== session.user.id && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const s3 = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY1,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY1,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: filename,
    });

    // 1 hour presigned URL — long enough for the editor session + ffmpeg fetch
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return Response.json({ url });
  } catch (error) {
    console.error("Presign error:", error);
    return Response.json(
      { error: `Failed to generate video URL: ${error?.message || "unknown"}` },
      { status: 500 }
    );
  }
}
