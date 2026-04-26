import { z } from "zod";

// ==================== SHARED PRIMITIVES ====================

const scoreSchema = z.number().min(1).max(10).transform((v) => Math.round(v * 10) / 10);

const intSchema = z.number().transform((v) => Math.floor(v)).pipe(z.number().int().min(0));

const nonEmptyStringArray = z.array(z.string());

// ==================== AI OUTPUT SCHEMAS ====================

/**
 * Phase 1 — Core analysis data (parse + score + metrics + ATS).
 */
export const coreAnalysisDataSchema = z.object({
  overallScore: scoreSchema,
  scores: z.object({
    atsCompatibility: scoreSchema,
    contentQuality: scoreSchema,
    impact: scoreSchema,
    readability: scoreSchema,
  }),
  experienceLevel: z.enum([
    "Entry-Level",
    "Junior",
    "Mid-Level",
    "Senior",
    "Lead/Principal",
    "Executive",
  ]),
  yearsOfExperience: z.number().min(0),
  metrics: z.object({
    wordCount: intSchema,
    pageCount: intSchema,
    bulletPointCount: intSchema,
    skillsCount: intSchema,
    uniqueSkillsCount: intSchema,
    experienceEntriesCount: intSchema,
    educationEntriesCount: intSchema,
    hasEmail: z.boolean(),
    hasPhone: z.boolean(),
    hasLinkedin: z.boolean(),
    hasPortfolio: z.boolean(),
    grammarIssuesCount: intSchema,
    spellingIssuesCount: intSchema,
    passiveVoiceCount: intSchema,
    measurableAchievementsCount: intSchema,
    actionVerbCount: intSchema,
    buzzwordCount: intSchema,
    sectionCompletenessScore: z.number().min(0).max(100).transform((v) => Math.round(v)),
  }),
  parsedData: z.object({
    fullName: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    technicalSkills: nonEmptyStringArray,
    softSkills: nonEmptyStringArray,
    jobTitles: nonEmptyStringArray,
    education: z.array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        field: z.string(),
        year: z.string(),
      }),
    ),
    workExperiences: z.array(
      z.object({
        company: z.string(),
        title: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        description: z.string(),
      }),
    ),
    projects: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        technologies: nonEmptyStringArray,
      }),
    ),
    certifications: z.array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        year: z.string(),
      }),
    ),
  }),
  atsCompatibility: z.object({
    score: z.number().min(0).max(100).transform((v) => Math.round(v)),
    issues: nonEmptyStringArray,
  }),
  keyAchievements: nonEmptyStringArray,
});

/**
 * Phase 2 — Feedback + legacy compatibility fields.
 */
export const feedbackDataSchema = z.object({
  feedback: z.object({
    summary: z.string().min(1),
    hiringRecommendation: z.enum([
      "Strong Hire",
      "Hire",
      "Maybe",
      "No Hire",
      "Needs More Info",
    ]),
    strengths: nonEmptyStringArray,
    weaknesses: nonEmptyStringArray,
    improvementAreas: nonEmptyStringArray,
    missingSkills: nonEmptyStringArray,
    redFlags: nonEmptyStringArray,
    suggestions: z.object({
      immediate: nonEmptyStringArray,
      shortTerm: nonEmptyStringArray,
      longTerm: nonEmptyStringArray,
    }),
  }),
  hiringRecommendation: z.enum([
    "Strong Hire",
    "Hire",
    "Maybe",
    "No Hire",
    "Needs More Info",
  ]),
  summary: z.string().min(1),
  strengthAreas: nonEmptyStringArray,
  improvementAreas: nonEmptyStringArray,
  missingSkills: nonEmptyStringArray,
  redFlags: nonEmptyStringArray,
  detectedSkills: z.object({
    technical: nonEmptyStringArray,
    soft: nonEmptyStringArray,
  }),
  recommendations: z.object({
    immediate: nonEmptyStringArray,
    shortTerm: nonEmptyStringArray,
    longTerm: nonEmptyStringArray,
  }),
});

/**
 * NOT_A_RESUME error from Phase 1.
 */
export const notAResumeSchema = z.object({
  error: z.literal("NOT_A_RESUME"),
  message: z.string(),
  detectedType: z.string().optional(),
});

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

/**
 * POST /history request body validation.
 */
export const createHistoryBodySchema = z.object({
  resumeText: z.string().min(1, "resumeText is required").max(50000),
  sourceType: z.enum(["pdf", "text"]).optional(),
  originalFileName: z.string().max(255).optional(),
  analysis: z.object({
    overallScore: z.number(),
    scores: z.object({
      atsCompatibility: z.number(),
      contentQuality: z.number(),
      impact: z.number(),
      readability: z.number(),
    }),
  }),
});

// ==================== DATABASE ROW SCHEMA ====================

/**
 * Validates the flat joined row returned by COMPOSITE_SELECT + COMPOSITE_JOINS.
 * Used to replace 40+ unchecked `as` casts in mapRowToComposite.
 */
export const compositeRowSchema = z.object({
  analysis_id: z.string(),
  user_id: z.string(),
  input_text_hash: z.string(),
  original_file_name: z.string().nullable(),
  source_type: z.string(),
  ai_model_version: z.string().nullable(),
  analysis_version: z.coerce.number(),
  processing_time_ms: z.coerce.number().nullable(),
  analysis_created_at: z.coerce.date(),
  analysis_updated_at: z.coerce.date(),

  metrics_id: z.string(),
  overall_score: z.coerce.number(),
  ats_compatibility_score: z.coerce.number(),
  content_quality_score: z.coerce.number(),
  impact_score: z.coerce.number(),
  readability_score: z.coerce.number(),
  section_completeness_score: z.coerce.number(),
  word_count: z.coerce.number(),
  page_count: z.coerce.number(),
  bullet_point_count: z.coerce.number(),
  skills_count: z.coerce.number(),
  unique_skills_count: z.coerce.number(),
  experience_entries_count: z.coerce.number(),
  education_entries_count: z.coerce.number(),
  has_email: z.coerce.boolean(),
  has_phone: z.coerce.boolean(),
  has_linkedin: z.coerce.boolean(),
  has_portfolio: z.coerce.boolean(),
  grammar_issues_count: z.coerce.number(),
  spelling_issues_count: z.coerce.number(),
  passive_voice_count: z.coerce.number(),
  measurable_achievements_count: z.coerce.number().nullable(),
  action_verb_count: z.coerce.number().nullable(),
  buzzword_count: z.coerce.number().nullable(),
  ats_issues: z.array(z.string()),
  metrics_created_at: z.coerce.date(),
  metrics_updated_at: z.coerce.date(),

  parsed_data_id: z.string(),
  full_name: z.string().nullable(),
  parsed_email: z.string().nullable(),
  parsed_phone: z.string().nullable(),
  location: z.string().nullable(),
  experience_level: z.string().nullable(),
  total_experience_years: z.coerce.number().nullable(),
  technical_skills: z.array(z.string()),
  soft_skills: z.array(z.string()),
  job_titles: z.array(z.string()),
  education: z.array(z.unknown()),
  work_experiences: z.array(z.unknown()),
  projects: z.array(z.unknown()),
  certifications: z.array(z.unknown()),
  parsed_created_at: z.coerce.date(),
  parsed_updated_at: z.coerce.date(),

  feedback_id: z.string(),
  summary: z.string(),
  hiring_recommendation: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvement_areas: z.array(z.string()),
  missing_skills: z.array(z.string()),
  red_flags: z.array(z.string()),
  suggestions_immediate: z.array(z.string()),
  suggestions_short_term: z.array(z.string()),
  suggestions_long_term: z.array(z.string()),
  feedback_created_at: z.coerce.date(),
});
