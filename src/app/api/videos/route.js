import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";
import { generalLimiter } from "@/libs/rate-limit";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { success } = generalLimiter(session.user.email);
  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const videos = await prisma.video.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        originalName: true,
        status: true,
        createdAt: true,
      },
    });

    return Response.json({ videos });
  } catch (error) {
    console.error("Videos fetch error:", error);
    return Response.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
