import type { TranslationProvider } from "../types";
import { MockTranslationProvider } from "./mock";
import { OpenAITranslationProvider } from "./openai";
import { AnthropicTranslationProvider } from "./anthropic";
import { XAITranslationProvider } from "./xai";
import { GoogleTranslationProvider } from "./google";
import { FallbackTranslationProvider } from "./fallback";

function createSingleProvider(name: string): TranslationProvider {
  switch (name.toLowerCase().trim()) {
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
 * 1. TRANSLATION_PROVIDERS – comma-separated list (e.g. "google,mock")
 * 2. TRANSLATION_PROVIDER – single provider name
 * 3. If GOOGLE_API_KEY / GEMINI_API_KEY is set → google, then mock
 * 4. Default: mock
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

  const single = process.env.TRANSLATION_PROVIDER?.trim().toLowerCase();
  if (single) {
    return tryCreateProvider(single) ?? new MockTranslationProvider();
  }

  // Auto-pick Google when a key is present (common Vercel setup)
  if (hasGoogleKey()) {
    const google = tryCreateProvider("google");
    if (google) {
      return new FallbackTranslationProvider([google, new MockTranslationProvider()]);
    }
  }

  return new MockTranslationProvider();
}

export { MockTranslationProvider } from "./mock";
export { OpenAITranslationProvider } from "./openai";
export { AnthropicTranslationProvider } from "./anthropic";
export { XAITranslationProvider } from "./xai";
export { GoogleTranslationProvider } from "./google";
export { FallbackTranslationProvider } from "./fallback";
