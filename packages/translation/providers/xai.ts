import type { TranslationProvider, TranslationRequest, TranslationResult } from "../types";

/**
 * xAI / Grok provider.
 * Uses the OpenAI-compatible Chat Completions endpoint at api.x.ai.
 */
export class XAITranslationProvider implements TranslationProvider {
  name = "xai";

  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(opts?: { apiKey?: string; baseUrl?: string; model?: string }) {
    this.apiKey = opts?.apiKey ?? process.env.XAI_API_KEY ?? "";
    this.baseUrl = (opts?.baseUrl ?? process.env.XAI_BASE_URL ?? "https://api.x.ai/v1").replace(/\/$/, "");
    this.model = opts?.model ?? process.env.XAI_MODEL ?? "grok-3";

    if (!this.apiKey) {
      throw new Error("XAI_API_KEY is required when using the xAI translation provider");
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
      throw new Error(`xAI API error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from xAI API");
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
