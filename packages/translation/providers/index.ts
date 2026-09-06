import type { TranslationProvider } from "../types";
import { MockTranslationProvider } from "./mock";
import { OpenAITranslationProvider } from "./openai";
import { AnthropicTranslationProvider } from "./anthropic";
import { XAITranslationProvider } from "./xai";
import { GoogleTranslationProvider } from "./google";
import { HuggingFaceTranslationProvider } from "./huggingface";
import { FallbackTranslationProvider } from "./fallback";

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/^['"]|['"]$/g, "");
}

function createSingleProvider(name: string): TranslationProvider {
  switch (normalizeName(name)) {
    case "openai":
      return new OpenAITranslationProvider();
    case "anthropic":
    case "claude":
      return new AnthropicTranslationProvider();
    case "xai":
    case "grok":
      return new XAITranslationProvider();
    case "google":
    case "gemini":
      return new GoogleTranslationProvider();
    case "huggingface":
    case "hf":
      return new HuggingFaceTranslationProvider();
    case "mock":
      return new MockTranslationProvider();
    default:
      throw new Error(`Unknown translation provider: ${name}`);
  }
}

function tryCreateProvider(name: string): TranslationProvider | null {
  try {
    return createSingleProvider(name);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[translation] skipping provider "${name}": ${msg}`);
    return null;
  }
}

function hasGoogleKey(): boolean {
  return Boolean(process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim());
}

function hasHuggingFaceKey(): boolean {
  return Boolean(process.env.HF_TOKEN?.trim() || process.env.HUGGINGFACE_API_KEY?.trim());
}

/**
 * Build the active translation provider.
 *
 * Priority:
 * 1. TRANSLATION_PROVIDERS – comma-separated list
 * 2. TRANSLATION_PROVIDER – single name
 * 3. Auto: google if key, else huggingface if token, else mock
 */
export function createTranslationProvider(): TranslationProvider {
  const list = process.env.TRANSLATION_PROVIDERS?.trim();

  if (list) {
    const names = list.split(",").map((s) => s.trim()).filter(Boolean);
    const providers = names
      .map(tryCreateProvider)
      .filter((p): p is TranslationProvider => p !== null);

    if (providers.length === 0) {
      return new MockTranslationProvider();
    }
    if (providers.length === 1) {
      return providers[0];
    }
    return new FallbackTranslationProvider(providers);
  }

  const single = process.env.TRANSLATION_PROVIDER?.trim();
  if (single) {
    return tryCreateProvider(single) ?? new MockTranslationProvider();
  }

  if (hasGoogleKey()) {
    return createSingleProvider("google");
  }

  if (hasHuggingFaceKey()) {
    return createSingleProvider("huggingface");
  }

  return new MockTranslationProvider();
}

export { MockTranslationProvider } from "./mock";
export { OpenAITranslationProvider } from "./openai";
export { AnthropicTranslationProvider } from "./anthropic";
export { XAITranslationProvider } from "./xai";
export { GoogleTranslationProvider } from "./google";
export { HuggingFaceTranslationProvider } from "./huggingface";
export { FallbackTranslationProvider } from "./fallback";
