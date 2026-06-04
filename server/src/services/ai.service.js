const AI_API_URL = process.env.AI_API_URL || "http://localhost:8000/analyze";
const TIMEOUT_MS = 180000;

export async function analyzeVideoWithAI(videoPath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;

  try {
    response = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: videoPath }),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("AI analysis timed out. Try a shorter video.");
    }
    throw new Error("Could not connect to the AI service. Make sure the Python API is running on port 8000.");
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.detail || "AI analysis service failed");
  }

  return { isViolent: Boolean(body.is_violent) };
}
