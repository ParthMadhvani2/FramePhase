import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";
import { getS3ClientConfig, getBucketName } from "@/libs/aws-config";

/**
 * Streams a video from the private S3 bucket through our server so the
 * browser doesn't need to hit S3 directly. This is a CORS workaround for
 * buckets without a CORS policy, but it routes ALL video bytes through
 * Netlify Functions — only viable for small videos (up to ~10 MB).
 *
 * For larger files the user should configure an S3 CORS policy and use
 * /api/video-url (presigned GET URL) directly.
 *
 * GET /api/video-proxy?filename=<newName>
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

  // Ownership check — same as /api/video-url
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
    const s3 = new S3Client(getS3ClientConfig());
    const command = new GetObjectCommand({
      Bucket: getBucketName(),
      Key: filename,
    });
    const s3Response = await s3.send(command);

    // Stream the body straight through to the browser
    return new Response(s3Response.Body, {
      status: 200,
      headers: {
        "Content-Type": s3Response.ContentType || "video/mp4",
        "Content-Length": String(s3Response.ContentLength || ""),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Video proxy error:", error);
    return Response.json(
      { error: `Failed to stream video: ${error?.message || "unknown"}` },
      { status: 500 }
    );
  }
}
