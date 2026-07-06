// backend/services/geminiService.js
//
// Thin wrapper around the Gemini API. This is the ONLY place in the codebase
// that talks to Gemini. The API key is read from process.env.GEMINI_API_KEY
// and is never sent to, or exposed on, the frontend.

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Sends a prompt to Gemini and returns the plain-text reply.
 * Throws a descriptive error on failure so callers can produce a friendly
 * fallback message instead of crashing.
 */
async function askGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }

  let response;
  try {
    response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 512,
        },
      }),
    });
  } catch (networkErr) {
    throw new Error("NETWORK_ERROR");
  }

  if (!response.ok) {
    let details = "";
    try {
      const errBody = await response.json();
      details = errBody?.error?.message || "";
    } catch (_) {
      // ignore parse failure, we'll use status text instead
    }
    throw new Error(`GEMINI_API_ERROR: ${response.status} ${details}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

  if (!text) {
    throw new Error("GEMINI_EMPTY_RESPONSE");
  }

  return text.trim();
}

module.exports = { askGemini };
