import type { TranslationProvider, TranslationRequest, TranslationResult } from "../types";

/**
 * OpenAI-compatible chat completion provider.
 * Uses environment variables so the rest of the app stays provider-agnostic.
 *
 * Prompt emphasizes natural phrasing, cultural context, and honesty about uncertainty.
 */
export class OpenAITranslationProvider implements TranslationProvider {
  name = "openai";

  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(opts?: { apiKey?: string; baseUrl?: string; model?: string }) {
    this.apiKey = opts?.apiKey ?? process.env.OPENAI_API_KEY ?? "";
    this.baseUrl = (opts?.baseUrl ?? process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
    this.model = opts?.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is required when using the OpenAI translation provider");
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

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Translation API error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from translation API");
    }

    let parsed: { translatedText?: string; confidence?: string; notes?: string };
    try {
      parsed = JSON.parse(content);
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
