import type { TranslationProvider, TranslationRequest, TranslationResult } from "../types";

/**
 * Hugging Face Inference provider (OpenAI-compatible chat endpoint).
 * Free account + token; no credit card required for basic use.
 *
 * Env:
 *   HF_TOKEN or HUGGINGFACE_API_KEY
 *   HF_MODEL (default: a solid small instruct model on HF)
 *   HF_BASE_URL (default: router.huggingface.co OpenAI-compatible API)
 */
export class HuggingFaceTranslationProvider implements TranslationProvider {
  name = "huggingface";

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(opts?: { apiKey?: string; model?: string; baseUrl?: string }) {
    this.apiKey = (
      opts?.apiKey ??
      process.env.HF_TOKEN ??
      process.env.HUGGINGFACE_API_KEY ??
      ""
    ).trim();

    // Default: capable instruct model available on HF Inference
    this.model = (
      opts?.model ??
      process.env.HF_MODEL ??
      "meta-llama/Meta-Llama-3.1-8B-Instruct"
    ).trim();

    this.baseUrl = (
      opts?.baseUrl ??
      process.env.HF_BASE_URL ??
      "https://router.huggingface.co/v1"
    ).replace(/\/$/, "");

    if (!this.apiKey) {
      throw new Error("HF_TOKEN (or HUGGINGFACE_API_KEY) is required for the Hugging Face provider");
    }
  }

  async translate(input: TranslationRequest): Promise<TranslationResult> {
    const { sourceLanguage, targetLanguage, text } = input;

    const systemPrompt = `You are a careful translator specializing in Nigerian languages, especially Urhobo and English.

Rules:
- Produce natural, fluent ${targetLanguage === "urhobo" ? "Urhobo" : "English"} rather than literal word-for-word translation.
- Preserve meaning, tone, and register.
- Prefer natural sentence structure used by native speakers.
- Respect cultural context; avoid inventing words a native speaker would not recognize.
- If uncertain, say so briefly in notes and still give your best attempt.
- Do not claim the translation is authoritative. Native speaker review is essential.

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

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new Error(`Hugging Face API error ${res.status}: ${raw.slice(0, 300)}`);
    }

    let data: {
      choices?: Array<{ message?: { content?: string } }>;
      error?: string | { message?: string };
    };
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Hugging Face returned non-JSON: ${raw.slice(0, 200)}`);
    }

    if (data.error) {
      const msg = typeof data.error === "string" ? data.error : data.error.message;
      throw new Error(`Hugging Face API: ${msg ?? "unknown error"}`);
    }

    const content = data.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) {
      throw new Error("Empty response from Hugging Face API");
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
