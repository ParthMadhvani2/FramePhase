import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { GetTranscriptionJobCommand, StartTranscriptionJobCommand, TranscribeClient } from "@aws-sdk/client-transcribe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { transcribeLimiter } from "@/libs/rate-limit";
import prisma from "@/libs/prisma";

function getClient() {
  return new TranscribeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY1,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY1,
    },
  });
}

function createTranscriptionCommand(filename, languageCode) {
  const params = {
    TranscriptionJobName: filename,
    OutputBucketName: process.env.BUCKET_NAME,
    OutputKey: filename + '.transcription',
    Media: {
      MediaFileUri: 's3://' + process.env.BUCKET_NAME + '/' + filename,
    },
  };

  // If specific language is provided, use it; otherwise auto-detect
  if (languageCode && languageCode !== 'auto') {
    params.LanguageCode = languageCode;
  } else {
    params.IdentifyLanguage = true;
  }

  return new StartTranscriptionJobCommand(params);
}

async function createTranscriptionJob(filename, languageCode) {
  const transcribeClient = getClient();
  const transcriptionCommand = createTranscriptionCommand(filename, languageCode);
  return transcribeClient.send(transcriptionCommand);
}

async function getJob(filename) {
  const transcribeClient = getClient();
  let jobStatusResult = null;
  try {
    const transcriptionJobStatusCommand = new GetTranscriptionJobCommand({
      TranscriptionJobName: filename,
    });
    jobStatusResult = await transcribeClient.send(transcriptionJobStatusCommand);
  } catch (e) {
    // Job doesn't exist yet — not an error
  }
  return jobStatusResult;
}

async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);
  });
}

async function getTranscriptionFile(filename) {
  const transcriptionFile = filename + '.transcription';
  const s3client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY1,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY1,
    },
  });
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: transcriptionFile,
  });
  let transcriptionFileResponse = null;
  try {
    transcriptionFileResponse = await s3client.send(getObjectCommand);
  } catch (e) {
    // File not ready yet
  }
  if (transcriptionFileResponse) {
    return JSON.parse(
      await streamToString(transcriptionFileResponse.Body)
    );
  }
  return null;
}

export async function GET(req) {
  // Auth check — prevent unauthenticated access to AWS Transcribe
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Rate limit by user email
  const { success, resetIn } = transcribeLimiter(session.user.email);
  if (!success) {
    return Response.json(
      { error: "Too many requests. Please wait." },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) },
      }
    );
  }

  const url = new URL(req.url);
  const filename = url.searchParams.get('filename');

  // Validate filename to prevent path traversal
  if (!filename || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return Response.json({ error: "Invalid filename" }, { status: 400 });
  }

  // Find ready transcription
  const transcription = await getTranscriptionFile(filename);
  if (transcription) {
    // Mark video as completed in database
    try {
      await prisma.video.updateMany({
        where: { filename, userId: session.user.id },
        data: { status: 'completed' },
      });
    } catch (e) {
      // Non-critical — don't block response
    }

    return Response.json({
      status: 'COMPLETED',
      transcription,
    });
  }

  // Check if already transcribing
  const existingJob = await getJob(filename);

  if (existingJob) {
    return Response.json({
      status: existingJob.TranscriptionJob.TranscriptionJobStatus,
    });
  }

  // Create new transcription job with optional language
  const languageCode = url.searchParams.get('language') || 'auto';
  const newJob = await createTranscriptionJob(filename, languageCode);
  return Response.json({
    status: newJob.TranscriptionJob.TranscriptionJobStatus,
  });
}
