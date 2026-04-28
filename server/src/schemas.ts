import { z } from "zod";

// ==================== SHARED PRIMITIVES ====================

const scoreSchema = z.number().min(1).max(10).transform((v) => Math.round(v * 10) / 10);

const intSchema = z.number().transform((v) => Math.floor(v)).pipe(z.number().int().min(0));

const nonEmptyStringArray = z.array(z.string());

// ==================== AI OUTPUT SCHEMAS ====================

/**
 * Job comparison result.
 */
export const jobComparisonResultSchema = z.object({
  matchPercentage: z.number().min(0).max(100).transform((v) => Math.round(v * 10) / 10),
  matchLevel: z.enum(["Poor", "Fair", "Good", "Excellent"]),
  missingSkills: z.object({
    critical: nonEmptyStringArray,
    important: nonEmptyStringArray,
    nice_to_have: nonEmptyStringArray,
  }),
  presentSkills: z.object({
    exact_matches: nonEmptyStringArray,
    partial_matches: nonEmptyStringArray,
    transferable_skills: nonEmptyStringArray,
  }),
  suggestions: z.array(
    z.object({
      priority: z.enum(["High", "Medium", "Low"]),
      category: z.string(),
      action: z.string(),
    }),
  ),
  keyword_analysis: z.object({
    total_keywords: intSchema,
    matched_keywords: intSchema,
    missing_keywords: nonEmptyStringArray,
  }),
  experience_gap: z.object({
    required_years: z.number(),
    candidate_years: z.number(),
    gap: z.number(),
    assessment: z.string(),
  }),
  recommendation: z.string(),
});

/**
 * Career map result.
 */
export const careerMapResultSchema = z.object({
  paths: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      difficulty: z.enum(["Low", "Medium", "High"]),
      timeToGoal: z.string(),
      steps: z.array(
        z.object({
          role: z.string(),
          status: z.enum(["current", "future", "goal"]),
          skills_needed: nonEmptyStringArray.optional(),
          timeframe: z.string().optional(),
          salary_range: z.string().optional(),
        }),
      ),
    }),
  ),
  currentRole: z.string(),
  currentSkills: nonEmptyStringArray,
  recommendations: nonEmptyStringArray,
});

/**
 * Tailor result.
 */
export const tailorResultSchema = z.object({
  sections: z.array(
    z.object({
      name: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
      before: z.string(),
      after: z.string(),
      changes: nonEmptyStringArray,
      keywords_added: nonEmptyStringArray,
    }),
  ),
  overall_strategy: z.string(),
  keywords_to_add: nonEmptyStringArray,
  keywords_already_present: nonEmptyStringArray,
  ats_improvement: z.object({
    before_score: z.number().min(0).max(100),
    after_score: z.number().min(0).max(100),
  }),
});

// ==================== REQUEST BODY SCHEMAS ====================

// Removed old schemas (coreAnalysisData, feedbackData, notAResume, compositeRow, createHistoryBody)
// Remaining schemas: jobComparisonResult, careerMapResult, tailorResult
