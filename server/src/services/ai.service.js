const DEFAULT_AI_API_URL = "http://localhost:8000/analyze";
const DEFAULT_AI_TIMEOUT_MS = 180000;

function normalizeSegments(response) {
  const segments = response.violent_segments || response.violent_clips || [];

  return segments.map((segment, index) => ({
    clipIndex: segment.clip_index ?? segment.clipIndex ?? index,
    startSecond: segment.start_second ?? segment.startSecond ?? index * 3,
    endSecond: segment.end_second ?? segment.endSecond ?? (index + 1) * 3,
    confidence: segment.confidence ?? null
  }));
}

export async function analyzeVideoWithAI(videoPath) {
  const url = process.env.AI_API_URL || DEFAULT_AI_API_URL;
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || DEFAULT_AI_TIMEOUT_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: videoPath }),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `AI analysis timed out after ${Math.round(timeoutMs / 1000)} seconds. Try a shorter video or run the model on a faster machine.`
      );
    }

    throw new Error("Could not connect to the AI analysis service. Make sure the Python API is running on port 8000.");
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.detail || "AI analysis service failed");
  }

  return {
    isViolent: Boolean(body.is_violent ?? body.isViolent),
    totalClips: Number(body.total_clips ?? body.totalClips ?? 0),
    violentSegments: normalizeSegments(body),
    status: body.status || "success",
    rawResponse: body
  };
}
