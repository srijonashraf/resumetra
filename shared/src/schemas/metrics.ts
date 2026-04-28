import { z } from "zod";

export const formattingIssueSchema = z.object({
  type: z.string().min(1),
  severity: z.enum(["high", "medium", "low"]),
  description: z.string().min(1),
  location: z.string().optional(),
});

export const deterministicMetricsSchema = z.object({
  wordCount: z.number().int().min(0),
  bulletCount: z.number().int().min(0),
  avgBulletWordCount: z.number().min(0),
  sectionsPresent: z.array(z.string()),
  sectionsMissing: z.array(z.string()),
  bulletsWithActionVerb: z.number().int().min(0),
  bulletsWithMetric: z.number().int().min(0),
  formattingIssues: z.array(formattingIssueSchema),
  careerLevelDetected: z.string().min(1),
  totalExperienceMonths: z.number().int().min(0),
});

export const partialMatchSchema = z.object({
  jdKeyword: z.string().min(1),
  resumeKeyword: z.string().min(1),
  similarity: z.number().min(0).max(1),
});

export const atsReportSchema = z.object({
  matchScore: z.number().min(0).max(100),
  resumeKeywords: z.array(z.string()),
  jdKeywords: z.array(z.string()),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  partialMatches: z.array(partialMatchSchema),
  sectionCoverage: z.record(z.string(), z.boolean()),
});
