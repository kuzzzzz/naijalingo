import { z } from "zod";

export const TranslationRequestSchema = z.object({
  sourceLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  text: z.string().min(1).max(5000),
});

export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;

export type Confidence = "high" | "medium" | "low" | "unknown";

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: Confidence;
  notes?: string;
  provider: string;
}

export interface TranslationProvider {
  name: string;
  translate(input: TranslationRequest): Promise<TranslationResult>;
}

const SYSTEM_PROMPT = (targetLanguage: string) =>
  `You are a careful translator specializing in Nigerian languages, especially Urhobo and English.

Rules:
- Produce natural, fluent ${targetLanguage === "urhobo" ? "Urhobo" : "English"} rather than literal word-for-word translation.
- Preserve meaning, tone, and register.
- Prefer natural sentence structure used by native speakers.
- Respect cultural context; avoid inventing words a native speaker would not recognize.
- If uncertain, say so briefly in notes and still give your best attempt.
- Do not claim the translation is authoritative.

Respond with ONLY a JSON object (no markdown fences):
{
  "translatedText": "...",
  "confidence": "high" | "medium" | "low" | "unknown",
  "notes": "optional short note"
}`;

function parseModelJson(
  content: string,
  sourceLanguage: string,
  targetLanguage: string,
  provider: string
): TranslationResult {
  try {
    const cleaned = content.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as {
      translatedText?: string;
      confidence?: Confidence;
      notes?: string;
    };
    return {
      translatedText: parsed.translatedText ?? content.trim(),
      sourceLanguage,
      targetLanguage,
      confidence: parsed.confidence ?? "unknown",
      notes: parsed.notes,
      provider,
    };
  } catch {
    return {
      translatedText: content.trim(),
      sourceLanguage,
      targetLanguage,
      confidence: "unknown",
      notes: "Response was not structured JSON; treated as plain translation.",
      provider,
    };
  }
}

class MockTranslationProvider implements TranslationProvider {
  name = "mock";
  async translate(input: TranslationRequest): Promise<TranslationResult> {
    await new Promise((r) => setTimeout(r, 300));
    const { sourceLanguage, targetLanguage, text } = input;
    const snippet = text.slice(0, 80) + (text.length > 80 ? "…" : "");
    return {
      translatedText:
        targetLanguage === "urhobo"
          ? `[Urhobo translation of: "${snippet}"]`
          : `[English translation of: "${snippet}"]`,
      sourceLanguage,
      targetLanguage,
      confidence: "unknown",
      notes:
        "This is a mock translation. Set HF_TOKEN + TRANSLATION_PROVIDERS=huggingface on Vercel for real results.",
      provider: this.name,
    };
  }
}

class HuggingFaceTranslationProvider implements TranslationProvider {
  name = "huggingface";
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = (process.env.HF_TOKEN ?? process.env.HUGGINGFACE_API_KEY ?? "").trim();
    this.model = (process.env.HF_MODEL ?? "meta-llama/Meta-Llama-3.1-8B-Instruct").trim();
    this.baseUrl = (process.env.HF_BASE_URL ?? "https://router.huggingface.co/v1").replace(/\/$/, "");
    if (!this.apiKey) {
      throw new Error("HF_TOKEN is required for Hugging Face provider");
    }
  }

  async translate(input: TranslationRequest): Promise<TranslationResult> {
    const { sourceLanguage, targetLanguage, text } = input;
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
          { role: "system", content: SYSTEM_PROMPT(targetLanguage) },
          {
            role: "user",
            content: `Translate from ${sourceLanguage} to ${targetLanguage}.\n\nText:\n"""\n${text}\n"""`,
          },
        ],
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      throw new Error(`Hugging Face API error ${res.status}: ${raw.slice(0, 300)}`);
    }
    const data = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: string | { message?: string };
    };
    if (data.error) {
      const msg = typeof data.error === "string" ? data.error : data.error.message;
      throw new Error(`Hugging Face API: ${msg ?? "unknown error"}`);
    }
    const content = data.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) throw new Error("Empty response from Hugging Face API");
    return parseModelJson(content, sourceLanguage, targetLanguage, this.name);
  }
}

class GoogleTranslationProvider implements TranslationProvider {
  name = "google";
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = (process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "").trim();
    this.model = (process.env.GOOGLE_MODEL ?? "gemini-2.0-flash").trim();
    if (!this.apiKey) throw new Error("GOOGLE_API_KEY is required for Google provider");
  }

  async translate(input: TranslationRequest): Promise<TranslationResult> {
    const { sourceLanguage, targetLanguage, text } = input;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT(targetLanguage) }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Translate from ${sourceLanguage} to ${targetLanguage}.\n\nText:\n"""\n${text}\n"""`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
      }),
    });
    const raw = await res.text();
    if (!res.ok) throw new Error(`Google Gemini API error ${res.status}: ${raw.slice(0, 300)}`);
    const data = JSON.parse(raw) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (data.error?.message) throw new Error(`Google Gemini API: ${data.error.message}`);
    const content = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!content.trim()) throw new Error("Empty response from Google Gemini API");
    return parseModelJson(content, sourceLanguage, targetLanguage, this.name);
  }
}

function tryCreate(name: string): TranslationProvider | null {
  try {
    switch (name.toLowerCase().trim().replace(/^['"]|['"]$/g, "")) {
      case "huggingface":
      case "hf":
        return new HuggingFaceTranslationProvider();
      case "google":
      case "gemini":
        return new GoogleTranslationProvider();
      case "mock":
        return new MockTranslationProvider();
      default:
        console.warn(`[translation] unknown provider: ${name}`);
        return null;
    }
  } catch (err) {
    console.warn(`[translation] skip ${name}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export function createTranslationProvider(): TranslationProvider {
  const list = process.env.TRANSLATION_PROVIDERS?.trim();
  if (list) {
    for (const name of list.split(",").map((s) => s.trim()).filter(Boolean)) {
      const p = tryCreate(name);
      if (p && p.name !== "mock") return p;
      if (p && p.name === "mock") return p;
    }
  }

  const single = process.env.TRANSLATION_PROVIDER?.trim();
  if (single) {
    return tryCreate(single) ?? new MockTranslationProvider();
  }

  if (process.env.HF_TOKEN?.trim() || process.env.HUGGINGFACE_API_KEY?.trim()) {
    return tryCreate("huggingface") ?? new MockTranslationProvider();
  }
  if (process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim()) {
    return tryCreate("google") ?? new MockTranslationProvider();
  }

  return new MockTranslationProvider();
}
