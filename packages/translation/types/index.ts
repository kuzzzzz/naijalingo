import { z } from "zod";

export const TranslationRequestSchema = z.object({
  sourceLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  text: z.string().min(1).max(5000),
});

export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  /** Provider may set low confidence; UI should encourage correction */
  confidence?: "high" | "medium" | "low" | "unknown";
  /** Optional note from the model (e.g. "uncertain about dialect") */
  notes?: string;
  provider?: string;
}

export interface TranslationProvider {
  name: string;
  translate(input: TranslationRequest): Promise<TranslationResult>;
}
