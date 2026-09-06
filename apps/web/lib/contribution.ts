import { z } from "zod";

export const TranslationContributionSchema = z.object({
  id: z.string().uuid().optional(),
  sourceLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  sourceText: z.string().min(1).max(5000),
  targetText: z.string().min(1).max(5000),
  context: z.string().max(2000).optional(),
  dialect: z.string().max(200).optional(),
  contributorName: z.string().max(100).optional(),
  consentForResearch: z.boolean(),
  status: z.enum(["pending", "reviewed", "accepted", "rejected"]).default("pending"),
  createdAt: z.string().datetime().optional(),
});

export type TranslationContribution = z.infer<typeof TranslationContributionSchema>;
