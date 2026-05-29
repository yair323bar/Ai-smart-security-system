const DEFAULT_AI_API_URL = "http://localhost:8000/analyze";

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
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: videoPath })
  });

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
