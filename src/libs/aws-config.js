/**
 * Centralized AWS credential + region resolver.
 *
 * Accepts several env var naming conventions so it works regardless of which
 * set of names are defined in the hosting env (Netlify, Vercel, local .env):
 *   - AWS_ACCESS_KEY1          / AWS_SECRET_ACCESS_KEY1     (legacy FramePhase)
 *   - AWS_ACCESS_KEY_ID        / AWS_SECRET_ACCESS_KEY       (AWS standard)
 *   - FRAMEPHASE_AWS_ACCESS_KEY_ID / FRAMEPHASE_AWS_SECRET_ACCESS_KEY (namespaced)
 *
 * Values are `.trim()`ed to handle accidental trailing newlines pasted into
 * hosting dashboards (a common cause of SignatureDoesNotMatch errors).
 */

const pick = (...keys) => {
  for (const k of keys) {
    const v = process.env[k];
    if (typeof v === "string" && v.trim().length > 0) {
      return v.trim();
    }
  }
  return undefined;
};

export function getAwsCredentials() {
  return {
    accessKeyId: pick(
      "AWS_ACCESS_KEY1",
      "AWS_ACCESS_KEY_ID",
      "FRAMEPHASE_AWS_ACCESS_KEY_ID"
    ),
    secretAccessKey: pick(
      "AWS_SECRET_ACCESS_KEY1",
      "AWS_SECRET_ACCESS_KEY",
      "FRAMEPHASE_AWS_SECRET_ACCESS_KEY"
    ),
  };
}

export function getAwsRegion() {
  return pick("AWS_REGION", "FRAMEPHASE_AWS_REGION") || "us-east-1";
}

export function getBucketName() {
  return pick("BUCKET_NAME", "S3_BUCKET_NAME", "FRAMEPHASE_BUCKET_NAME");
}

export function getS3ClientConfig() {
  return {
    region: getAwsRegion(),
    credentials: getAwsCredentials(),
  };
}
