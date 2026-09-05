import { z } from "zod";

/**
 * Contribution and dataset schemas.
 * Designed so collected data can later become a versioned research dataset.
 * VoiceContribution is defined for future use but not fully implemented in MVP.
 */

export const ContributionStatusSchema = z.enum([
  "pending",
  "reviewed",
  "accepted",
  "rejected",
]);

export type ContributionStatus = z.infer<typeof ContributionStatusSchema>;

export const TranslationContributionSchema = z.object({
  id: z.string().uuid().optional(), // generated server-side
  sourceLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  sourceText: z.string().min(1).max(5000),
  targetText: z.string().min(1).max(5000),
  context: z.string().max(2000).optional(),
  dialect: z.string().max(200).optional(),
  contributorName: z.string().max(100).optional(),
  consentForResearch: z.boolean(),
  status: ContributionStatusSchema.default("pending"),
  createdAt: z.string().datetime().optional(),
});

export type TranslationContribution = z.infer<typeof TranslationContributionSchema>;

/**
 * Future voice contribution shape.
 * Do not implement upload UI yet – only the interface.
 */
export const VoiceContributionSchema = z.object({
  id: z.string().uuid().optional(),
  language: z.string().min(2),
  transcript: z.string().min(1).max(5000),
  audioUrl: z.string().url().optional(), // future
  dialect: z.string().max(200).optional(),
  speakerMetadata: z
    .object({
      ageRange: z.string().optional(),
      gender: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
  consentForResearch: z.boolean(),
  status: ContributionStatusSchema.default("pending"),
  createdAt: z.string().datetime().optional(),
});

export type VoiceContribution = z.infer<typeof VoiceContributionSchema>;

/**
 * JSONL dataset record format for future training / research export.
 */
export const DatasetRecordSchema = z.object({
  source_language: z.string(),
  target_language: z.string(),
  source: z.string(),
  target: z.string(),
  context: z.string().nullable().optional(),
  dialect: z.string().nullable().optional(),
  quality: z.number().min(0).max(5).nullable().optional(),
  verified: z.boolean().default(false),
  contribution_id: z.string().optional(),
  version: z.string().optional(),
});

export type DatasetRecord = z.infer<typeof DatasetRecordSchema>;
