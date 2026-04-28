import pool from "../config/database";
import { TokenUsage } from "./aiService";
import { DatabaseError } from "../errors";

// ==================== TYPE DEFINITIONS ====================

/**
 * Structured analysis context reconstructed from stored DB data.
 * Used by derived AI endpoints (career-map, job-match, tailor).
 * Temporarily unused — endpoints return 503 until rebuilt in Phase 3.
 */
export interface AnalysisContext {
  overallScore: number;
  scores: {
    atsCompatibility: number;
    contentQuality: number;
    impact: number;
    readability: number;
  };
  experienceLevel: string;
  yearsOfExperience: number;
  metrics: {
    wordCount: number;
    pageCount: number;
    bulletPointCount: number;
    skillsCount: number;
    uniqueSkillsCount: number;
    experienceEntriesCount: number;
    educationEntriesCount: number;
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedin: boolean;
    hasPortfolio: boolean;
    grammarIssuesCount: number;
    spellingIssuesCount: number;
    passiveVoiceCount: number;
    measurableAchievementsCount: number;
    actionVerbCount: number;
    buzzwordCount: number;
    sectionCompletenessScore: number;
  };
  parsedData: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    technicalSkills: string[];
    softSkills: string[];
    jobTitles: string[];
    education: unknown[];
    workExperiences: unknown[];
    projects: unknown[];
    certifications: unknown[];
  };
  atsCompatibility: {
    score: number;
    issues: string[];
  };
  feedback: {
    summary: string;
    hiringRecommendation: string;
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
    missingSkills: string[];
    redFlags: string[];
    suggestions: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
  };
}

// ==================== DELETE ====================

/**
 * Delete a single analysis (cascades to metrics, parsed_data, feedback).
 * Returns true if deleted.
 */
export const deleteAnalysis = async (
  id: string,
  userId: string,
): Promise<boolean> => {
  const query = `
    DELETE FROM public.resume_analyses
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;

  try {
    const result = await pool.query(query, [id, userId]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting analysis:", error);
    throw new DatabaseError("Failed to delete analysis", { details: error });
  }
};

// ==================== TOKEN USAGE TRACKING ====================

export interface TokenUsageRecord {
  analysisId?: string | null;
  userId?: string | null;
  endpoint: string;
  phase: string;
  model: string;
  usage: TokenUsage;
}

/**
 * Batch-insert token usage records. Failures are logged but not thrown (non-critical).
 */
export const saveTokenUsage = async (
  records: TokenUsageRecord[],
): Promise<void> => {
  if (records.length === 0) return;

  const values: unknown[] = [];
  const placeholders: string[] = [];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const offset = i * 8;
    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`,
    );
    values.push(
      r.analysisId ?? null,
      r.userId ?? null,
      r.endpoint,
      r.phase,
      r.model,
      r.usage.inputTokens,
      r.usage.outputTokens,
      r.usage.totalTokens,
    );
  }

  const query = `
    INSERT INTO public.token_usage (analysis_id, user_id, endpoint, phase, model, input_tokens, output_tokens, total_tokens)
    VALUES ${placeholders.join(", ")}
  `;

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error("Token usage save failed", {
      recordCount: records.length,
      endpoints: records.map((r) => r.endpoint),
      error,
    });
  }
};

// ==================== CAREER MAP CACHE ====================

/**
 * Retrieve a cached career map for an analysis, if one exists.
 */
export const getCachedCareerMap = async (
  analysisId: string,
  userId: string,
): Promise<unknown | null> => {
  const result = await pool.query(
    `SELECT career_map_data FROM public.resume_analyses WHERE id = $1 AND user_id = $2`,
    [analysisId, userId],
  );
  return result.rows[0]?.career_map_data ?? null;
};

/**
 * Persist a generated career map result against its analysis.
 */
export const saveCareerMap = async (
  analysisId: string,
  userId: string,
  data: unknown,
): Promise<void> => {
  await pool.query(
    `UPDATE public.resume_analyses SET career_map_data = $1, updated_at = now() WHERE id = $2 AND user_id = $3`,
    [JSON.stringify(data), analysisId, userId],
  );
};
