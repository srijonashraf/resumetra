import crypto from "crypto";
import pool from "../config/database";
import { ResumeAnalysisSuccess, TokenUsage } from "./aiService";
import { DatabaseError } from "../errors";
import { compositeRowSchema } from "../schemas";

// ==================== TYPE DEFINITIONS ====================

interface ResumeAnalysis {
  id: string;
  user_id: string;
  input_text_hash: string;
  original_file_name: string | null;
  source_type: string;
  ai_model_version: string | null;
  analysis_version: number;
  processing_time_ms: number | null;
  created_at: Date;
  updated_at: Date;
}

interface ResumeMetrics {
  id: string;
  analysis_id: string;
  overall_score: number;
  ats_compatibility_score: number;
  content_quality_score: number;
  impact_score: number;
  readability_score: number;
  section_completeness_score: number;
  word_count: number;
  page_count: number;
  bullet_point_count: number;
  skills_count: number;
  unique_skills_count: number;
  experience_entries_count: number;
  education_entries_count: number;
  has_email: boolean;
  has_phone: boolean;
  has_linkedin: boolean;
  has_portfolio: boolean;
  grammar_issues_count: number;
  spelling_issues_count: number;
  passive_voice_count: number;
  measurable_achievements_count: number | null;
  action_verb_count: number | null;
  buzzword_count: number | null;
  ats_issues: string[];
  created_at: Date;
  updated_at: Date;
}

interface ResumeParsedData {
  id: string;
  analysis_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  experience_level: string | null;
  total_experience_years: number | null;
  technical_skills: string[];
  soft_skills: string[];
  job_titles: string[];
  education: unknown[];
  work_experiences: unknown[];
  projects: unknown[];
  certifications: unknown[];
  created_at: Date;
  updated_at: Date;
}

interface ResumeFeedback {
  id: string;
  analysis_id: string;
  summary: string;
  hiring_recommendation: string;
  strengths: string[];
  weaknesses: string[];
  improvement_areas: string[];
  missing_skills: string[];
  red_flags: string[];
  suggestions_immediate: string[];
  suggestions_short_term: string[];
  suggestions_long_term: string[];
  created_at: Date;
}

interface AnalysisComposite {
  analysis: ResumeAnalysis;
  metrics: ResumeMetrics;
  parsedData: ResumeParsedData;
  feedback: ResumeFeedback;
}

export interface CreateAnalysisInput {
  user_id: string;
  resume_text: string;
  source_type: string;
  original_file_name?: string;
  ai_result: ResumeAnalysisSuccess;
  ai_model_version?: string;
  processing_time_ms?: number;
}

/**
 * Structured analysis context reconstructed from stored DB data.
 * Used by derived AI endpoints (career-map, job-match, tailor) instead of raw resume text.
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

export interface HistorySummary {
  total_analyses: number;
  average_overall_score: number;
  average_ats_score: number;
  average_content_quality_score: number;
  average_impact_score: number;
  average_readability_score: number;
  latest_analysis: Date | null;
  score_trend: {
    date: Date;
    overall_score: number;
  }[];
}

// ==================== MAPPING FUNCTION ====================

const sanitizeScoreRange = (
  value: number,
  min: number,
  max: number,
  fallback: number,
): number => {
  if (isNaN(value) || value < min || value > max) return fallback;
  return Math.round(value * 10) / 10;
};

const sanitizeInt = (value: number, fallback: number = 0): number => {
  if (isNaN(value) || value < 0) return fallback;
  return Math.floor(value);
};

/**
 * Decomposes a ResumeAnalysisSuccess into data for all 4 tables.
 */
const mapAiResultToTables = (
  input: CreateAnalysisInput,
): {
  analysis: Omit<ResumeAnalysis, "id" | "created_at" | "updated_at"> & {
    input_text_hash: string;
  };
  metrics: Omit<
    ResumeMetrics,
    "id" | "analysis_id" | "created_at" | "updated_at"
  >;
  parsedData: Omit<
    ResumeParsedData,
    "id" | "analysis_id" | "created_at" | "updated_at"
  >;
  feedback: Omit<ResumeFeedback, "id" | "analysis_id" | "created_at">;
} => {
  const ai = input.ai_result;

  const input_text_hash = crypto
    .createHash("sha256")
    .update(input.resume_text)
    .digest("hex");

  return {
    analysis: {
      user_id: input.user_id,
      input_text_hash,
      original_file_name: input.original_file_name ?? null,
      source_type: input.source_type,
      ai_model_version: input.ai_model_version ?? "unknown",
      analysis_version: 1,
      processing_time_ms: input.processing_time_ms ?? null,
    },
    metrics: {
      overall_score: sanitizeScoreRange(ai.overallScore, 1, 10, 1),
      ats_compatibility_score: sanitizeScoreRange(
        ai.scores.atsCompatibility ?? ai.atsCompatibility?.score ?? 50,
        1,
        100,
        50,
      ),
      content_quality_score: sanitizeScoreRange(
        ai.scores.contentQuality ?? 5,
        1,
        10,
        5,
      ),
      impact_score: sanitizeScoreRange(ai.scores.impact ?? 5, 1, 10, 5),
      readability_score: sanitizeScoreRange(
        ai.scores.readability ?? 5,
        1,
        10,
        5,
      ),
      section_completeness_score: sanitizeScoreRange(
        ai.metrics?.sectionCompletenessScore ?? 0,
        0,
        100,
        0,
      ),
      word_count: sanitizeInt(ai.metrics?.wordCount ?? 0),
      page_count: sanitizeInt(ai.metrics?.pageCount ?? 1, 1),
      bullet_point_count: sanitizeInt(ai.metrics?.bulletPointCount ?? 0),
      skills_count: sanitizeInt(ai.metrics?.skillsCount ?? 0),
      unique_skills_count: sanitizeInt(ai.metrics?.uniqueSkillsCount ?? 0),
      experience_entries_count: sanitizeInt(
        ai.metrics?.experienceEntriesCount ?? 0,
      ),
      education_entries_count: sanitizeInt(
        ai.metrics?.educationEntriesCount ?? 0,
      ),
      has_email: ai.metrics?.hasEmail ?? false,
      has_phone: ai.metrics?.hasPhone ?? false,
      has_linkedin: ai.metrics?.hasLinkedin ?? false,
      has_portfolio: ai.metrics?.hasPortfolio ?? false,
      grammar_issues_count: sanitizeInt(ai.metrics?.grammarIssuesCount ?? 0),
      spelling_issues_count: sanitizeInt(ai.metrics?.spellingIssuesCount ?? 0),
      passive_voice_count: sanitizeInt(ai.metrics?.passiveVoiceCount ?? 0),
      measurable_achievements_count:
        ai.metrics?.measurableAchievementsCount ?? null,
      action_verb_count: ai.metrics?.actionVerbCount ?? null,
      buzzword_count: ai.metrics?.buzzwordCount ?? null,
      ats_issues: ai.atsCompatibility?.issues ?? [],
    },
    parsedData: {
      full_name: ai.parsedData?.fullName ?? null,
      email: ai.parsedData?.email ?? null,
      phone: ai.parsedData?.phone ?? null,
      location: ai.parsedData?.location ?? null,
      experience_level: ai.experienceLevel ?? null,
      total_experience_years: ai.yearsOfExperience ?? null,
      technical_skills:
        ai.parsedData?.technicalSkills ?? ai.detectedSkills?.technical ?? [],
      soft_skills: ai.parsedData?.softSkills ?? ai.detectedSkills?.soft ?? [],
      job_titles: ai.parsedData?.jobTitles ?? [],
      education: ai.parsedData?.education ?? [],
      work_experiences: ai.parsedData?.workExperiences ?? [],
      projects: ai.parsedData?.projects ?? [],
      certifications: ai.parsedData?.certifications ?? [],
    },
    feedback: {
      summary: ai.feedback?.summary ?? ai.summary ?? "No summary available",
      hiring_recommendation:
        ai.feedback?.hiringRecommendation ?? ai.hiringRecommendation ?? "Maybe",
      strengths: ai.feedback?.strengths ?? ai.strengthAreas ?? [],
      weaknesses: ai.feedback?.weaknesses ?? [],
      improvement_areas:
        ai.feedback?.improvementAreas ?? ai.improvementAreas ?? [],
      missing_skills: ai.feedback?.missingSkills ?? ai.missingSkills ?? [],
      red_flags: ai.feedback?.redFlags ?? ai.redFlags ?? [],
      suggestions_immediate:
        ai.feedback?.suggestions?.immediate ??
        ai.recommendations?.immediate ??
        [],
      suggestions_short_term:
        ai.feedback?.suggestions?.shortTerm ??
        ai.recommendations?.shortTerm ??
        [],
      suggestions_long_term:
        ai.feedback?.suggestions?.longTerm ??
        ai.recommendations?.longTerm ??
        [],
    },
  };
};

// ==================== SHARED JOIN QUERY ====================

const COMPOSITE_SELECT = `
  SELECT
    ra.id AS analysis_id, ra.user_id, ra.input_text_hash, ra.original_file_name,
    ra.source_type, ra.ai_model_version, ra.analysis_version, ra.processing_time_ms,
    ra.created_at AS analysis_created_at, ra.updated_at AS analysis_updated_at,

    rm.id AS metrics_id, rm.overall_score, rm.ats_compatibility_score,
    rm.content_quality_score, rm.impact_score, rm.readability_score,
    rm.section_completeness_score, rm.word_count, rm.page_count, rm.bullet_point_count,
    rm.skills_count, rm.unique_skills_count, rm.experience_entries_count, rm.education_entries_count,
    rm.has_email, rm.has_phone, rm.has_linkedin, rm.has_portfolio,
    rm.grammar_issues_count, rm.spelling_issues_count, rm.passive_voice_count,
    rm.measurable_achievements_count, rm.action_verb_count, rm.buzzword_count,
    rm.ats_issues, rm.created_at AS metrics_created_at, rm.updated_at AS metrics_updated_at,

    rpd.id AS parsed_data_id, rpd.full_name, rpd.email AS parsed_email, rpd.phone AS parsed_phone,
    rpd.location, rpd.experience_level, rpd.total_experience_years,
    rpd.technical_skills, rpd.soft_skills, rpd.job_titles,
    rpd.education, rpd.work_experiences, rpd.projects, rpd.certifications,
    rpd.created_at AS parsed_created_at, rpd.updated_at AS parsed_updated_at,

    rf.id AS feedback_id, rf.summary, rf.hiring_recommendation,
    rf.strengths, rf.weaknesses, rf.improvement_areas, rf.missing_skills, rf.red_flags,
    rf.suggestions_immediate, rf.suggestions_short_term, rf.suggestions_long_term,
    rf.created_at AS feedback_created_at
`;

const COMPOSITE_JOINS = `
  FROM public.resume_analyses ra
  JOIN public.resume_metrics rm ON rm.analysis_id = ra.id
  JOIN public.resume_parsed_data rpd ON rpd.analysis_id = ra.id
  JOIN public.resume_feedback rf ON rf.analysis_id = ra.id
`;

const mapRowToComposite = (row: Record<string, unknown>): AnalysisComposite => {
  const validated = compositeRowSchema.parse(row);
  return {
    analysis: {
      id: validated.analysis_id,
      user_id: validated.user_id,
      input_text_hash: validated.input_text_hash,
      original_file_name: validated.original_file_name,
      source_type: validated.source_type,
      ai_model_version: validated.ai_model_version,
      analysis_version: validated.analysis_version,
      processing_time_ms: validated.processing_time_ms,
      created_at: validated.analysis_created_at,
      updated_at: validated.analysis_updated_at,
    },
    metrics: {
      id: validated.metrics_id,
      analysis_id: validated.analysis_id,
      overall_score: validated.overall_score,
      ats_compatibility_score: validated.ats_compatibility_score,
      content_quality_score: validated.content_quality_score,
      impact_score: validated.impact_score,
      readability_score: validated.readability_score,
      section_completeness_score: validated.section_completeness_score,
      word_count: validated.word_count,
      page_count: validated.page_count,
      bullet_point_count: validated.bullet_point_count,
      skills_count: validated.skills_count,
      unique_skills_count: validated.unique_skills_count,
      experience_entries_count: validated.experience_entries_count,
      education_entries_count: validated.education_entries_count,
      has_email: validated.has_email,
      has_phone: validated.has_phone,
      has_linkedin: validated.has_linkedin,
      has_portfolio: validated.has_portfolio,
      grammar_issues_count: validated.grammar_issues_count,
      spelling_issues_count: validated.spelling_issues_count,
      passive_voice_count: validated.passive_voice_count,
      measurable_achievements_count: validated.measurable_achievements_count,
      action_verb_count: validated.action_verb_count,
      buzzword_count: validated.buzzword_count,
      ats_issues: validated.ats_issues,
      created_at: validated.metrics_created_at,
      updated_at: validated.metrics_updated_at,
    },
    parsedData: {
      id: validated.parsed_data_id,
      analysis_id: validated.analysis_id,
      full_name: validated.full_name,
      email: validated.parsed_email,
      phone: validated.parsed_phone,
      location: validated.location,
      experience_level: validated.experience_level,
      total_experience_years: validated.total_experience_years,
      technical_skills: validated.technical_skills,
      soft_skills: validated.soft_skills,
      job_titles: validated.job_titles,
      education: validated.education,
      work_experiences: validated.work_experiences,
      projects: validated.projects,
      certifications: validated.certifications,
      created_at: validated.parsed_created_at,
      updated_at: validated.parsed_updated_at,
    },
    feedback: {
      id: validated.feedback_id,
      analysis_id: validated.analysis_id,
      summary: validated.summary,
      hiring_recommendation: validated.hiring_recommendation,
      strengths: validated.strengths,
      weaknesses: validated.weaknesses,
      improvement_areas: validated.improvement_areas,
      missing_skills: validated.missing_skills,
      red_flags: validated.red_flags,
      suggestions_immediate: validated.suggestions_immediate,
      suggestions_short_term: validated.suggestions_short_term,
      suggestions_long_term: validated.suggestions_long_term,
      created_at: validated.feedback_created_at,
    },
  };
};

// ==================== CRUD OPERATIONS ====================

/**
 * Decompose an AI analysis result into 4 normalized tables inside a transaction.
 * Upserts on conflict (same user + input hash) so re-analyses update in place.
 */
export const createAnalysis = async (
  input: CreateAnalysisInput,
): Promise<AnalysisComposite> => {
  const mapped = mapAiResultToTables(input);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const analysisResult = await client.query(
      `INSERT INTO public.resume_analyses (user_id, input_text_hash, original_file_name, source_type, ai_model_version, analysis_version, processing_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, input_text_hash) DO UPDATE SET
         ai_model_version = EXCLUDED.ai_model_version,
         analysis_version = resume_analyses.analysis_version + 1,
         processing_time_ms = EXCLUDED.processing_time_ms,
         updated_at = now()
       RETURNING *`,
      [
        mapped.analysis.user_id,
        mapped.analysis.input_text_hash,
        mapped.analysis.original_file_name,
        mapped.analysis.source_type,
        mapped.analysis.ai_model_version,
        mapped.analysis.analysis_version,
        mapped.analysis.processing_time_ms,
      ],
    );

    const analysisRow = analysisResult.rows[0];
    const analysisId = analysisRow.id;

    // Upsert metrics
    await client.query(
      `INSERT INTO public.resume_metrics (
        analysis_id, overall_score, ats_compatibility_score, content_quality_score,
        impact_score, readability_score, section_completeness_score,
        word_count, page_count, bullet_point_count,
        skills_count, unique_skills_count, experience_entries_count, education_entries_count,
        has_email, has_phone, has_linkedin, has_portfolio,
        grammar_issues_count, spelling_issues_count, passive_voice_count,
        measurable_achievements_count, action_verb_count, buzzword_count, ats_issues
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
      ON CONFLICT (analysis_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        ats_compatibility_score = EXCLUDED.ats_compatibility_score,
        content_quality_score = EXCLUDED.content_quality_score,
        impact_score = EXCLUDED.impact_score,
        readability_score = EXCLUDED.readability_score,
        section_completeness_score = EXCLUDED.section_completeness_score,
        word_count = EXCLUDED.word_count,
        page_count = EXCLUDED.page_count,
        bullet_point_count = EXCLUDED.bullet_point_count,
        skills_count = EXCLUDED.skills_count,
        unique_skills_count = EXCLUDED.unique_skills_count,
        experience_entries_count = EXCLUDED.experience_entries_count,
        education_entries_count = EXCLUDED.education_entries_count,
        has_email = EXCLUDED.has_email,
        has_phone = EXCLUDED.has_phone,
        has_linkedin = EXCLUDED.has_linkedin,
        has_portfolio = EXCLUDED.has_portfolio,
        grammar_issues_count = EXCLUDED.grammar_issues_count,
        spelling_issues_count = EXCLUDED.spelling_issues_count,
        passive_voice_count = EXCLUDED.passive_voice_count,
        measurable_achievements_count = EXCLUDED.measurable_achievements_count,
        action_verb_count = EXCLUDED.action_verb_count,
        buzzword_count = EXCLUDED.buzzword_count,
        ats_issues = EXCLUDED.ats_issues,
        updated_at = now()`,
      [
        analysisId,
        mapped.metrics.overall_score,
        mapped.metrics.ats_compatibility_score,
        mapped.metrics.content_quality_score,
        mapped.metrics.impact_score,
        mapped.metrics.readability_score,
        mapped.metrics.section_completeness_score,
        mapped.metrics.word_count,
        mapped.metrics.page_count,
        mapped.metrics.bullet_point_count,
        mapped.metrics.skills_count,
        mapped.metrics.unique_skills_count,
        mapped.metrics.experience_entries_count,
        mapped.metrics.education_entries_count,
        mapped.metrics.has_email,
        mapped.metrics.has_phone,
        mapped.metrics.has_linkedin,
        mapped.metrics.has_portfolio,
        mapped.metrics.grammar_issues_count,
        mapped.metrics.spelling_issues_count,
        mapped.metrics.passive_voice_count,
        mapped.metrics.measurable_achievements_count,
        mapped.metrics.action_verb_count,
        mapped.metrics.buzzword_count,
        mapped.metrics.ats_issues,
      ],
    );

    // Upsert parsed data
    await client.query(
      `INSERT INTO public.resume_parsed_data (
        analysis_id, full_name, email, phone, location,
        experience_level, total_experience_years,
        technical_skills, soft_skills, job_titles,
        education, work_experiences, projects, certifications
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (analysis_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        location = EXCLUDED.location,
        experience_level = EXCLUDED.experience_level,
        total_experience_years = EXCLUDED.total_experience_years,
        technical_skills = EXCLUDED.technical_skills,
        soft_skills = EXCLUDED.soft_skills,
        job_titles = EXCLUDED.job_titles,
        education = EXCLUDED.education,
        work_experiences = EXCLUDED.work_experiences,
        projects = EXCLUDED.projects,
        certifications = EXCLUDED.certifications,
        updated_at = now()`,
      [
        analysisId,
        mapped.parsedData.full_name,
        mapped.parsedData.email,
        mapped.parsedData.phone,
        mapped.parsedData.location,
        mapped.parsedData.experience_level,
        mapped.parsedData.total_experience_years,
        mapped.parsedData.technical_skills,
        mapped.parsedData.soft_skills,
        mapped.parsedData.job_titles,
        JSON.stringify(mapped.parsedData.education),
        JSON.stringify(mapped.parsedData.work_experiences),
        JSON.stringify(mapped.parsedData.projects),
        JSON.stringify(mapped.parsedData.certifications),
      ],
    );

    // Upsert feedback
    await client.query(
      `INSERT INTO public.resume_feedback (
        analysis_id, summary, hiring_recommendation,
        strengths, weaknesses, improvement_areas, missing_skills, red_flags,
        suggestions_immediate, suggestions_short_term, suggestions_long_term
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (analysis_id) DO UPDATE SET
        summary = EXCLUDED.summary,
        hiring_recommendation = EXCLUDED.hiring_recommendation,
        strengths = EXCLUDED.strengths,
        weaknesses = EXCLUDED.weaknesses,
        improvement_areas = EXCLUDED.improvement_areas,
        missing_skills = EXCLUDED.missing_skills,
        red_flags = EXCLUDED.red_flags,
        suggestions_immediate = EXCLUDED.suggestions_immediate,
        suggestions_short_term = EXCLUDED.suggestions_short_term,
        suggestions_long_term = EXCLUDED.suggestions_long_term`,
      [
        analysisId,
        mapped.feedback.summary,
        mapped.feedback.hiring_recommendation,
        mapped.feedback.strengths,
        mapped.feedback.weaknesses,
        mapped.feedback.improvement_areas,
        mapped.feedback.missing_skills,
        mapped.feedback.red_flags,
        mapped.feedback.suggestions_immediate,
        mapped.feedback.suggestions_short_term,
        mapped.feedback.suggestions_long_term,
      ],
    );

    await client.query("COMMIT");

    // Fetch and return the full composite using pool
    const composite = await pool.query(
      `${COMPOSITE_SELECT} ${COMPOSITE_JOINS} WHERE ra.id = $1`,
      [analysisId],
    );

    return mapRowToComposite(composite.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating analysis:", error);
    throw new DatabaseError("Failed to create analysis", { cause: error });
  } finally {
    client.release();
  }
};

/**
 * Return a paginated list of analysis composites for a user, newest first.
 */
export const getUserHistory = async (
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<AnalysisComposite[]> => {
  const query = `
    ${COMPOSITE_SELECT} ${COMPOSITE_JOINS}
    WHERE ra.user_id = $1
    ORDER BY ra.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  try {
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows.map(mapRowToComposite);
  } catch (error) {
    console.error("Error fetching user history:", error);
    throw new DatabaseError("Failed to fetch analysis history", {
      cause: error,
    });
  }
};

/**
 * Total number of analyses stored for a user.
 */
export const getUserHistoryCount = async (userId: string): Promise<number> => {
  const query = `SELECT COUNT(*) as count FROM public.resume_analyses WHERE user_id = $1`;

  try {
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error("Error counting user history:", error);
    throw new DatabaseError("Failed to count analysis history", {
      cause: error,
    });
  }
};

/**
 * Fetch a single analysis composite by ID, scoped to the owning user.
 */
export const getAnalysisById = async (
  id: string,
  userId: string,
): Promise<AnalysisComposite | null> => {
  const query = `
    ${COMPOSITE_SELECT} ${COMPOSITE_JOINS}
    WHERE ra.id = $1 AND ra.user_id = $2
  `;

  try {
    const result = await pool.query(query, [id, userId]);
    if (result.rows.length === 0) return null;
    return mapRowToComposite(result.rows[0]);
  } catch (error) {
    console.error("Error fetching analysis by ID:", error);
    throw new DatabaseError("Failed to fetch analysis", { cause: error });
  }
};

/**
 * Convert a stored AnalysisComposite into a structured AnalysisContext
 * for use by derived AI endpoints. Reconstructs camelCase AI-usable shapes
 * from snake_case DB rows.
 *
 * ATS score scale: DB stores 0-100 in ats_compatibility_score.
 * - scores.atsCompatibility = ats_compatibility_score / 10 (0-10 scale)
 * - atsCompatibility.score = ats_compatibility_score (0-100 scale)
 */
const compositeToContext = (composite: AnalysisComposite): AnalysisContext => {
  const { metrics, parsedData, feedback } = composite;

  return {
    overallScore: metrics.overall_score,
    scores: {
      atsCompatibility: metrics.ats_compatibility_score / 10,
      contentQuality: metrics.content_quality_score,
      impact: metrics.impact_score,
      readability: metrics.readability_score,
    },
    experienceLevel: parsedData.experience_level ?? "Mid-Level",
    yearsOfExperience: parsedData.total_experience_years ?? 0,
    metrics: {
      wordCount: metrics.word_count,
      pageCount: metrics.page_count,
      bulletPointCount: metrics.bullet_point_count,
      skillsCount: metrics.skills_count,
      uniqueSkillsCount: metrics.unique_skills_count,
      experienceEntriesCount: metrics.experience_entries_count,
      educationEntriesCount: metrics.education_entries_count,
      hasEmail: metrics.has_email,
      hasPhone: metrics.has_phone,
      hasLinkedin: metrics.has_linkedin,
      hasPortfolio: metrics.has_portfolio,
      grammarIssuesCount: metrics.grammar_issues_count,
      spellingIssuesCount: metrics.spelling_issues_count,
      passiveVoiceCount: metrics.passive_voice_count,
      measurableAchievementsCount: metrics.measurable_achievements_count ?? 0,
      actionVerbCount: metrics.action_verb_count ?? 0,
      buzzwordCount: metrics.buzzword_count ?? 0,
      sectionCompletenessScore: metrics.section_completeness_score,
    },
    parsedData: {
      fullName: parsedData.full_name,
      email: parsedData.email,
      phone: parsedData.phone,
      location: parsedData.location,
      technicalSkills: parsedData.technical_skills,
      softSkills: parsedData.soft_skills,
      jobTitles: parsedData.job_titles,
      education: parsedData.education,
      workExperiences: parsedData.work_experiences,
      projects: parsedData.projects,
      certifications: parsedData.certifications,
    },
    atsCompatibility: {
      score: metrics.ats_compatibility_score,
      issues: metrics.ats_issues,
    },
    feedback: {
      summary: feedback.summary,
      hiringRecommendation: feedback.hiring_recommendation,
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
      improvementAreas: feedback.improvement_areas,
      missingSkills: feedback.missing_skills,
      redFlags: feedback.red_flags,
      suggestions: {
        immediate: feedback.suggestions_immediate,
        shortTerm: feedback.suggestions_short_term,
        longTerm: feedback.suggestions_long_term,
      },
    },
  };
};

/**
 * Load structured analysis context by analysisId, scoped to the owning user.
 * Returns null if not found or not owned by the user.
 */
export const getAnalysisContext = async (
  analysisId: string,
  userId: string,
): Promise<AnalysisContext | null> => {
  const composite = await getAnalysisById(analysisId, userId);
  if (!composite) return null;
  return compositeToContext(composite);
};

/**
 * Aggregate statistics across all of a user's analyses:
 * average scores, total count, latest date, and score trend over time.
 */
export const getUserHistorySummary = async (
  userId: string,
): Promise<HistorySummary> => {
  const summaryQuery = `
    SELECT
      COUNT(*) as total_analyses,
      COALESCE(AVG(rm.overall_score), 0) as average_overall_score,
      COALESCE(AVG(rm.ats_compatibility_score), 0) as average_ats_score,
      COALESCE(AVG(rm.content_quality_score), 0) as average_content_quality_score,
      COALESCE(AVG(rm.impact_score), 0) as average_impact_score,
      COALESCE(AVG(rm.readability_score), 0) as average_readability_score,
      MAX(ra.created_at) as latest_analysis
    FROM public.resume_analyses ra
    JOIN public.resume_metrics rm ON rm.analysis_id = ra.id
    WHERE ra.user_id = $1
  `;

  const trendQuery = `
    SELECT
      ra.created_at::date as date,
      COALESCE(AVG(rm.overall_score), 0) as overall_score
    FROM public.resume_analyses ra
    JOIN public.resume_metrics rm ON rm.analysis_id = ra.id
    WHERE ra.user_id = $1
    GROUP BY ra.created_at::date
    ORDER BY date DESC
    LIMIT 10
  `;

  try {
    const [summaryResult, trendResult] = await Promise.all([
      pool.query(summaryQuery, [userId]),
      pool.query(trendQuery, [userId]),
    ]);

    const row = summaryResult.rows[0];
    return {
      total_analyses: Number(row.total_analyses),
      average_overall_score: parseFloat(String(row.average_overall_score)),
      average_ats_score: parseFloat(String(row.average_ats_score)),
      average_content_quality_score: parseFloat(
        String(row.average_content_quality_score),
      ),
      average_impact_score: parseFloat(String(row.average_impact_score)),
      average_readability_score: parseFloat(
        String(row.average_readability_score),
      ),
      latest_analysis: row.latest_analysis,
      score_trend: trendResult.rows.map((r) => ({
        date: r.date as Date,
        overall_score: parseFloat(String(r.overall_score)),
      })),
    };
  } catch (error) {
    console.error("Error fetching history summary:", error);
    throw new DatabaseError("Failed to fetch history summary", {
      cause: error,
    });
  }
};

/**
 *  Top 10 most frequently missing skills across a user's analyses.
 */
export const getSkillGapTrends = async (
  userId: string,
): Promise<{ skill: string; frequency: number }[]> => {
  const query = `
    SELECT skill, COUNT(*) as frequency
    FROM public.resume_feedback,
    LATERAL unnest(missing_skills) as skill
    WHERE analysis_id IN (
      SELECT id FROM public.resume_analyses WHERE user_id = $1
    )
    GROUP BY skill
    ORDER BY frequency DESC
    LIMIT 10
  `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows.map((r) => ({
      skill: String(r.skill),
      frequency: Number(r.frequency),
    }));
  } catch (error) {
    console.error("Error fetching skill gap trends:", error);
    throw new DatabaseError("Failed to fetch skill gap trends", {
      cause: error,
    });
  }
};

/**
 * Chronological experience-level progression for a user (e.g., Junior → Mid → Senior).
 */
export const getExperienceLevelProgression = async (
  userId: string,
): Promise<{ date: Date; experience_level: string }[]> => {
  const query = `
    SELECT
      ra.created_at as date,
      rpd.experience_level
    FROM public.resume_analyses ra
    JOIN public.resume_parsed_data rpd ON rpd.analysis_id = ra.id
    WHERE ra.user_id = $1 AND rpd.experience_level IS NOT NULL
    ORDER BY ra.created_at ASC
  `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows.map((r) => ({
      date: r.date as Date,
      experience_level: String(r.experience_level),
    }));
  } catch (error) {
    console.error("Error fetching experience level progression:", error);
    throw new DatabaseError("Failed to fetch experience progression", {
      cause: error,
    });
  }
};

/**
 * Distribution of hiring recommendations (Strong Hire / Hire / Maybe / No Hire) for a user.
 */
export const getHiringRecommendationTrends = async (
  userId: string,
): Promise<{ hiring_recommendation: string; count: number }[]> => {
  const query = `
    SELECT
      rf.hiring_recommendation,
      COUNT(*) as count
    FROM public.resume_feedback rf
    JOIN public.resume_analyses ra ON ra.id = rf.analysis_id
    WHERE ra.user_id = $1
    GROUP BY rf.hiring_recommendation
    ORDER BY count DESC
  `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows.map((r) => ({
      hiring_recommendation: String(r.hiring_recommendation),
      count: Number(r.count),
    }));
  } catch (error) {
    console.error("Error fetching hiring recommendation trends:", error);
    throw new DatabaseError("Failed to fetch hiring recommendation trends", {
      cause: error,
    });
  }
};

/**
 *  Delete a single analysis (cascades to metrics, parsed_data, feedback). Returns true if deleted.
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
    throw new DatabaseError("Failed to delete analysis", { cause: error });
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
