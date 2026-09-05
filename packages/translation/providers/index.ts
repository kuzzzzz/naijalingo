import type { TranslationProvider } from "../types";
import { MockTranslationProvider } from "./mock";
import { OpenAITranslationProvider } from "./openai";
import { AnthropicTranslationProvider } from "./anthropic";
import { XAITranslationProvider } from "./xai";
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
    case "mock":
      return new MockTranslationProvider();
    default:
      throw new Error(`Unknown translation provider: ${name}`);
  }
}

/**
 * Build the active translation provider.
 *
 * Priority:
 * 1. TRANSLATION_PROVIDERS – comma-separated list (e.g. "xai,anthropic,openai,mock")
 * 2. TRANSLATION_PROVIDER – single provider name
 * 3. Default: mock
 */
export function createTranslationProvider(): TranslationProvider {
  const list = process.env.TRANSLATION_PROVIDERS?.trim();

  if (list) {
    const names = list.split(",").map((s) => s.trim()).filter(Boolean);
    if (names.length === 0) {
      return new MockTranslationProvider();
    }
    if (names.length === 1) {
      return createSingleProvider(names[0]);
    }
    const providers = names.map(createSingleProvider);
    return new FallbackTranslationProvider(providers);
  }

  const single = (process.env.TRANSLATION_PROVIDER ?? "mock").toLowerCase();
  return createSingleProvider(single);
}

export { MockTranslationProvider } from "./mock";
export { OpenAITranslationProvider } from "./openai";
export { AnthropicTranslationProvider } from "./anthropic";
export { XAITranslationProvider } from "./xai";
export { FallbackTranslationProvider } from "./fallback";
