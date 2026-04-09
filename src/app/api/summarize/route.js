import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { summarizeLimiter } from "@/libs/rate-limit";

/**
 * POST /api/summarize
 * Body: { text: string }
 * Response: { summary: string, source: 'anthropic' | 'openai' | 'hf' | 'extractive' }
 *
 * Summarization strategy (first success wins):
 *   1. Anthropic Claude (if ANTHROPIC_API_KEY is set) — best quality.
 *   2. OpenAI (if OPENAI_API_KEY is set).
 *   3. Hugging Face BART (if HF_TOKEN is set).
 *   4. Extractive fallback — TF-IDF + positional weighting.
 *
 * The extractive fallback used to just pick the top 3 sentences by word
 * frequency, which almost always surfaced the first three sentences of a
 * transcript verbatim (because intros are dense with topic keywords).
 * We now use a simple TF-IDF-ish score, penalize near-duplicate sentences,
 * and sample from across the whole transcript so the summary actually
 * reflects the full content.
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { success: rateLimitOk, resetIn } = summarizeLimiter(session.user.email);
  if (!rateLimitOk) {
    return Response.json(
      { error: "Too many requests. Please wait." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(resetIn / 1000)) } }
    );
  }

  try {
    const { text } = await req.json();
    if (!text || text.trim().length === 0) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    // Keep the input to ~8k chars; long transcripts get truncated from the
    // middle so we preserve both the intro and outro.
    const inputText = clampMiddle(text, 8000);

    // 1) Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const summary = await summarizeWithAnthropic(inputText);
        if (summary) return Response.json({ summary, source: "anthropic" });
      } catch (e) {
        console.warn("Anthropic summarize failed:", e?.message);
      }
    }

    // 2) OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const summary = await summarizeWithOpenAI(inputText);
        if (summary) return Response.json({ summary, source: "openai" });
      } catch (e) {
        console.warn("OpenAI summarize failed:", e?.message);
      }
    }

    // 3) Hugging Face BART — only bother if a token is present; the free
    // unauthenticated endpoint is rate-limited into uselessness.
    if (process.env.HF_TOKEN) {
      try {
        const summary = await summarizeWithHF(inputText);
        if (summary) return Response.json({ summary, source: "hf" });
      } catch (e) {
        console.warn("HF summarize failed:", e?.message);
      }
    }

    // 4) Extractive fallback
    const summary = extractiveSummarize(inputText);
    return Response.json({ summary, source: "extractive" });
  } catch (error) {
    console.error("Summarization error:", error);
    return Response.json({ error: "Failed to summarize" }, { status: 500 });
  }
}

// ---------- LLM providers ----------

async function summarizeWithAnthropic(text) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 350,
      messages: [
        {
          role: "user",
          content:
            "Summarize this video transcript in 3-5 concise sentences. Focus on the main topic, key points, and conclusion. Do NOT just quote the opening. Respond with ONLY the summary, no preamble.\n\nTranscript:\n" +
            text,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
  const data = await res.json();
  return data?.content?.[0]?.text?.trim() || null;
}

async function summarizeWithOpenAI(text) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You summarize video transcripts. Produce a 3-5 sentence summary of the main topic, key points, and conclusion. Do not quote the opening verbatim.",
        },
        { role: "user", content: text },
      ],
      max_tokens: 350,
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

async function summarizeWithHF(text) {
  const res = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
      },
      body: JSON.stringify({
        inputs: text.slice(0, 3500), // BART max ~1024 tokens
        parameters: { max_length: 220, min_length: 60, do_sample: false },
        options: { wait_for_model: true },
      }),
    }
  );
  if (!res.ok) throw new Error(`HF HTTP ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data[0]?.summary_text : data?.summary_text)?.trim() || null;
}

// ---------- Helpers ----------

/** Truncate long inputs by removing the middle, preserving intro + outro. */
function clampMiddle(text, maxLen) {
  if (text.length <= maxLen) return text;
  const half = Math.floor(maxLen / 2) - 20;
  return text.slice(0, half) + "\n...[transcript truncated]...\n" + text.slice(-half);
}

/**
 * Extractive summarizer. Better than "top 3 by word frequency" because it:
 *   - uses tf-idf-ish scoring (penalizes super common words),
 *   - applies positional weighting (first/last sentences boosted slightly),
 *   - penalizes near-duplicate sentences (Jaccard similarity),
 *   - spreads picks across the whole transcript so you don't just get the intro.
 */
function extractiveSummarize(text, maxSentences = 4) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length === 0) return normalized.slice(0, 400);
  if (sentences.length <= maxSentences) return sentences.join(" ");

  const stopWords = new Set([
    "the","a","an","and","or","but","in","on","at","to","for","of","with","by",
    "is","was","are","were","be","been","being","have","has","had","do","does",
    "did","will","would","could","should","may","might","shall","can","it","its",
    "this","that","these","those","i","you","he","she","we","they","me","him",
    "her","us","them","my","your","his","our","their","not","no","so","if","then",
    "than","just","also","very","too","as","from","about","into","out","up","down",
    "over","under","again","more","most","some","such","only","own","same","other",
    "yeah","okay","uh","um","like","gonna","wanna","really","know","think","one",
    "two","get","got","go","going","come","coming","thing","things","way","ways",
    "lot","lots","guys","guy","hey","right","well","now","here","there","where",
  ]);

  const tokenize = (s) => (s.toLowerCase().match(/\b[a-z]{3,}\b/g) || []).filter((w) => !stopWords.has(w));

  // Document frequency (how many sentences contain each word)
  const df = {};
  const sentTokens = sentences.map((s) => {
    const toks = tokenize(s);
    const uniq = new Set(toks);
    uniq.forEach((w) => { df[w] = (df[w] || 0) + 1; });
    return toks;
  });
  const N = sentences.length;

  // Score sentences by tf-idf-ish sum, normalized by length, with positional boost
  const scored = sentences.map((sentence, idx) => {
    const toks = sentTokens[idx];
    if (toks.length === 0) return { sentence, score: 0, idx, tokens: new Set() };
    const tf = {};
    for (const w of toks) tf[w] = (tf[w] || 0) + 1;
    let score = 0;
    for (const [w, f] of Object.entries(tf)) {
      const idf = Math.log(1 + N / (df[w] || 1));
      score += f * idf;
    }
    score /= Math.sqrt(toks.length); // length normalization
    // Positional weight: slight boost for first 20% and last 20%
    const pos = idx / N;
    if (pos < 0.2 || pos > 0.8) score *= 1.1;
    return { sentence, score, idx, tokens: new Set(toks) };
  });

  // Greedy MMR-like selection — pick the highest-scoring sentence that isn't
  // too similar to ones already selected.
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const picked = [];
  const jaccard = (a, b) => {
    if (a.size === 0 || b.size === 0) return 0;
    let inter = 0;
    for (const w of a) if (b.has(w)) inter++;
    return inter / (a.size + b.size - inter);
  };
  for (const cand of sorted) {
    if (picked.length >= maxSentences) break;
    const tooSimilar = picked.some((p) => jaccard(p.tokens, cand.tokens) > 0.45);
    if (!tooSimilar) picked.push(cand);
  }
  // Preserve original order
  picked.sort((a, b) => a.idx - b.idx);
  return picked.map((p) => p.sentence).join(" ");
}
