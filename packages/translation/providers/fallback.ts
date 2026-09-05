import type { TranslationProvider, TranslationRequest, TranslationResult } from "../types";

/**
 * Tries providers in order. First success wins.
 */
export class FallbackTranslationProvider implements TranslationProvider {
  name = "fallback";

  constructor(private providers: TranslationProvider[]) {
    if (providers.length === 0) {
      throw new Error("FallbackTranslationProvider requires at least one provider");
    }
  }

  async translate(input: TranslationRequest): Promise<TranslationResult> {
    const errors: string[] = [];

    for (const provider of this.providers) {
      try {
        const result = await provider.translate(input);
        return {
          ...result,
          provider: result.provider ?? provider.name,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${provider.name}: ${msg}`);
        console.warn(`[translation] provider ${provider.name} failed:`, msg);
      }
    }

    throw new Error(
      `All translation providers failed:\n${errors.map((e) => `- ${e}`).join("\n")}`
    );
  }
}
