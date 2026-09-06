import type { TranslationProvider, TranslationRequest, TranslationResult } from "../types";

/**
 * Google Gemini provider.
 * Uses the Generative Language API. Good free-tier option for MVP.
 * Key: GOOGLE_API_KEY or GEMINI_API_KEY
 */
export class GoogleTranslationProvider implements TranslationProvider {
  name = "google";

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(opts?: { apiKey?: string; model?: string; baseUrl?: string }) {
    this.apiKey =
      opts?.apiKey ??
      process.env.GOOGLE_API_KEY ??
      process.env.GEMINI_API_KEY ??
      "";
    this.model = opts?.model ?? process.env.GOOGLE_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
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
- If you are uncertain about a word, dialect form, or cultural nuance, say so briefly in a short note and still give your best attempt.
- Never invent Urhobo that a native speaker would not recognize.
- Do not claim the translation is authoritative. Native speaker review is essential.

Respond with ONLY a JSON object of this shape (no markdown fences):
{
  "translatedText": "...",
  "confidence": "high" | "medium" | "low" | "unknown",
  "notes": "optional short note about uncertainty or dialect"
}`;

    const userPrompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.

Text:
"""
${text}
"""`;

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Google Gemini API error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const content = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
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
