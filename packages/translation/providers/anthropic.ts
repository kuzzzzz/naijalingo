import type { TranslationProvider, TranslationRequest, TranslationResult } from "../types";

/**
 * Anthropic Claude provider.
 * Uses the Messages API. Key and model come from environment variables.
 */
export class AnthropicTranslationProvider implements TranslationProvider {
  name = "anthropic";

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(opts?: { apiKey?: string; model?: string; baseUrl?: string }) {
    this.apiKey = opts?.apiKey ?? process.env.ANTHROPIC_API_KEY ?? "";
    this.model = opts?.model ?? process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest";
    this.baseUrl = (opts?.baseUrl ?? process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com").replace(/\/$/, "");

    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is required when using the Anthropic translation provider");
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

    const res = await fetch(`${this.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Anthropic API error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const content = data.content?.find((c) => c.type === "text")?.text;
    if (!content) {
      throw new Error("Empty response from Anthropic API");
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
