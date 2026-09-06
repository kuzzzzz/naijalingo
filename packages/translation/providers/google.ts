import type { TranslationProvider, TranslationRequest, TranslationResult } from "../types";

/**
 * Google Gemini provider (Generative Language API).
 * Env: GOOGLE_API_KEY or GEMINI_API_KEY
 */
export class GoogleTranslationProvider implements TranslationProvider {
  name = "google";

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(opts?: { apiKey?: string; model?: string; baseUrl?: string }) {
    this.apiKey = (
      opts?.apiKey ??
      process.env.GOOGLE_API_KEY ??
      process.env.GEMINI_API_KEY ??
      ""
    ).trim();
    this.model = (
      opts?.model ??
      process.env.GOOGLE_MODEL ??
      process.env.GEMINI_MODEL ??
      "gemini-2.0-flash"
    ).trim();
    this.baseUrl = (
      opts?.baseUrl ??
      process.env.GOOGLE_BASE_URL ??
      "https://generativelanguage.googleapis.com/v1beta"
    ).replace(/\/$/, "");

    if (!this.apiKey) {
      throw new Error("GOOGLE_API_KEY (or GEMINI_API_KEY) is required for the Google translation provider");
    }
  }

  async translate(input: TranslationRequest): Promise<TranslationResult> {
    const { sourceLanguage, targetLanguage, text } = input;

    const systemPrompt = `You are a careful translator specializing in Nigerian languages, especially Urhobo and English.

Rules:
- Produce natural, fluent ${targetLanguage === "urhobo" ? "Urhobo" : "English"} rather than literal word-for-word translation.
- Preserve meaning, tone, and register.
- Prefer natural sentence structure used by native speakers.
- Respect cultural context; avoid inventing words or phrases that do not exist in the language.
- If you are uncertain, say so briefly in notes and still give your best attempt.
- Never invent Urhobo a native speaker would not recognize.
- Do not claim the translation is authoritative.

Respond with ONLY a JSON object (no markdown fences):
{
  "translatedText": "...",
  "confidence": "high" | "medium" | "low" | "unknown",
  "notes": "optional short note"
}`;

    const userPrompt = `Translate from ${sourceLanguage} to ${targetLanguage}.

Text:
"""
${text}
"""`;

    const url = `${this.baseUrl}/models/${this.model}:generateContent`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new Error(`Google Gemini API error ${res.status}: ${raw.slice(0, 300)}`);
    }

    let data: {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Google Gemini returned non-JSON: ${raw.slice(0, 200)}`);
    }

    if (data.error?.message) {
      throw new Error(`Google Gemini API: ${data.error.message}`);
    }

    const content =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!content.trim()) {
      throw new Error("Empty response from Google Gemini API");
    }

    let parsed: { translatedText?: string; confidence?: string; notes?: string };
    try {
      const cleaned = content.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return {
        translatedText: content.trim(),
        sourceLanguage,
        targetLanguage,
        confidence: "unknown",
        notes: "Response was not structured JSON; treated as plain translation.",
        provider: this.name,
      };
    }

    return {
      translatedText: parsed.translatedText ?? content,
      sourceLanguage,
      targetLanguage,
      confidence: (parsed.confidence as TranslationResult["confidence"]) ?? "unknown",
      notes: parsed.notes,
      provider: this.name,
    };
  }
}
