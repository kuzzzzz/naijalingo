import type { TranslationProvider, TranslationRequest, TranslationResult } from "../types";

/**
 * Mock provider for local development and demos.
 * Returns a placeholder so the UI works without an API key.
 */
export class MockTranslationProvider implements TranslationProvider {
  name = "mock";

  async translate(input: TranslationRequest): Promise<TranslationResult> {
    await new Promise((r) => setTimeout(r, 400));

    const { sourceLanguage, targetLanguage, text } = input;

    const placeholder =
      targetLanguage === "urhobo"
        ? `[Urhobo translation of: "${text.slice(0, 80)}${text.length > 80 ? "…" : ""}"]`
        : `[English translation of: "${text.slice(0, 80)}${text.length > 80 ? "…" : ""}"]`;

    return {
      translatedText: placeholder,
      sourceLanguage,
      targetLanguage,
      confidence: "unknown",
      notes:
        "This is a mock translation. Configure a real provider via environment variables for actual results. Always have native speakers review output.",
      provider: this.name,
    };
  }
}
