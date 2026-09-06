import type { TranslationProvider } from "../types";
import { MockTranslationProvider } from "./mock";
import { OpenAITranslationProvider } from "./openai";
import { AnthropicTranslationProvider } from "./anthropic";
import { XAITranslationProvider } from "./xai";
import { GoogleTranslationProvider } from "./google";
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

/**
 * Build the active translation provider.
 *
 * Priority:
 * 1. TRANSLATION_PROVIDERS – comma-separated list
 * 2. TRANSLATION_PROVIDER – single name
 * 3. GOOGLE_API_KEY present → google only (errors surface; no silent mock)
 * 4. mock
 */
export function createTranslationProvider(): TranslationProvider {
  const list = process.env.TRANSLATION_PROVIDERS?.trim();

  if (list) {
    const names = list.split(",").map((s) => s.trim()).filter(Boolean);
    const providers = names
      .map(tryCreateProvider)
      .filter((p): p is TranslationProvider => p !== null);

    // If user asked for real providers but only mock could be built, still use mock
    if (providers.length === 0) {
      return new MockTranslationProvider();
    }
    if (providers.length === 1) {
      return providers[0];
    }

    // Prefer not to hide real-provider failures behind mock when a paid/free API key exists.
    // Keep mock in the chain only if it's explicitly listed AND there is at least one other provider.
    return new FallbackTranslationProvider(providers);
  }

  const single = process.env.TRANSLATION_PROVIDER?.trim();
  if (single) {
    return tryCreateProvider(single) ?? new MockTranslationProvider();
  }

  if (hasGoogleKey()) {
    // No silent mock fallback — if Google fails, the API returns the real error.
    return createSingleProvider("google");
  }

  return new MockTranslationProvider();
}

export { MockTranslationProvider } from "./mock";
export { OpenAITranslationProvider } from "./openai";
export { AnthropicTranslationProvider } from "./anthropic";
export { XAITranslationProvider } from "./xai";
export { GoogleTranslationProvider } from "./google";
export { FallbackTranslationProvider } from "./fallback";
