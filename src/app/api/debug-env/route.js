import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { getAwsCredentials, getAwsRegion, getBucketName } from "@/libs/aws-config";

/**
 * Admin-only diagnostic endpoint. Reports WHICH env vars the server can see
 * (never the values themselves), so we can quickly tell if Netlify is
 * serving stale env vars or if the wrong names are set.
 *
 * GET /api/debug-env — requires the caller to be an admin.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.isAdmin || session?.user?.plan === "admin";
  if (!isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const mask = (name) => {
    const v = process.env[name];
    if (!v) return { present: false };
    return {
      present: true,
      length: v.length,
      trimmedLength: v.trim().length,
      hasWhitespace: v !== v.trim(),
      firstChar: v[0],
      lastChar: v[v.length - 1],
    };
  };

  const creds = getAwsCredentials();

  return Response.json({
    resolved: {
      region: getAwsRegion(),
      bucket: getBucketName() || null,
      hasAccessKey: !!creds.accessKeyId,
      hasSecretKey: !!creds.secretAccessKey,
      accessKeyLength: creds.accessKeyId?.length || 0,
      accessKeyPrefix: creds.accessKeyId?.slice(0, 4) || null, // AWS access keys start with "AKIA"
    },
    rawEnvPresence: {
      AWS_ACCESS_KEY1: mask("AWS_ACCESS_KEY1"),
      AWS_SECRET_ACCESS_KEY1: mask("AWS_SECRET_ACCESS_KEY1"),
      AWS_ACCESS_KEY_ID: mask("AWS_ACCESS_KEY_ID"),
      AWS_SECRET_ACCESS_KEY: mask("AWS_SECRET_ACCESS_KEY"),
      AWS_REGION: mask("AWS_REGION"),
      BUCKET_NAME: mask("BUCKET_NAME"),
    },
  });
}
