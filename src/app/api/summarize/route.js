import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { summarizeLimiter } from "@/libs/rate-limit";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Rate limit by user email
  const { success: rateLimitOk, resetIn } = summarizeLimiter(session.user.email);
  if (!rateLimitOk) {
    return Response.json(
      { error: "Too many requests. Please wait." },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
    );
  }

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    // Truncate input to a reasonable length for summarization
    const inputText = text.slice(0, 4000);

    // Try Hugging Face Inference API (free, no key required for moderate usage)
    // Falls back to extractive summarization if HF is unavailable
    let summary;

    try {
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Optional: add HF token for higher rate limits
            ...(process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {}),
          },
          body: JSON.stringify({
            inputs: inputText,
            parameters: {
              max_length: 200,
              min_length: 40,
              do_sample: false,
            },
          }),
        }
      );

      if (hfResponse.ok) {
        const data = await hfResponse.json();
        summary = Array.isArray(data) ? data[0]?.summary_text : data?.summary_text;
      }
    } catch {
      // HF unavailable — fall through to extractive fallback
    }

    // Fallback: simple extractive summarization (no external API needed)
    if (!summary) {
      summary = extractiveSummarize(inputText);
    }

    return Response.json({ summary });
  } catch (error) {
    console.error("Summarization error:", error);
    return Response.json({ error: "Failed to summarize" }, { status: 500 });
  }
}

/**
 * Extractive summarization fallback.
 * Scores sentences by word frequency and returns the top ones.
 * No external API needed — runs entirely server-side.
 */
function extractiveSummarize(text, maxSentences = 3) {
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 15);

  if (sentences.length <= maxSentences) {
    return sentences.join(' ');
  }

  // Build word frequency map (skip common stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'it', 'its', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their', 'not', 'no',
    'so', 'if', 'then', 'than', 'just', 'also', 'very', 'too', 'as', 'from',
  ]);

  const wordFreq = {};
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  for (const w of words) {
    if (!stopWords.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  // Score each sentence by sum of its word frequencies
  const scored = sentences.map((s, idx) => {
    const sWords = s.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const score = sWords.reduce((sum, w) => sum + (wordFreq[w] || 0), 0) / (sWords.length || 1);
    return { sentence: s.trim(), score, idx };
  });

  // Pick top sentences, preserving original order
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.idx - b.idx);

  return top.map(t => t.sentence).join(' ');
}
