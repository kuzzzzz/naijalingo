import type { TranslationContribution } from "@/lib/contribution";
import { randomUUID } from "crypto";

/**
 * Simple in-memory store for MVP contributions.
 * TODO: Replace with PostgreSQL (or similar) when moving beyond local demos.
 */
const contributions: TranslationContribution[] = [];

export function addContribution(
  data: Omit<TranslationContribution, "id" | "status" | "createdAt">
): TranslationContribution {
  const record: TranslationContribution = {
    ...data,
    id: randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  contributions.push(record);
  return record;
}

export function listContributions(): TranslationContribution[] {
  return [...contributions];
}

export function getContributionCount(): number {
  return contributions.length;
}
