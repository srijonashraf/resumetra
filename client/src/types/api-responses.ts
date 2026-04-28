/**
 * Backend response DTOs — typed boundary between API responses and frontend types.
 * SSE events use camelCase (from AI output). History REST API uses snake_case (from PostgreSQL).
 */

// ==================== Shared Union Types ====================

export type ExperienceLevel =
  | "Entry-Level"
  | "Junior"
  | "Mid-Level"
  | "Senior"
  | "Lead/Principal"
  | "Executive";

export type HiringRecommendation =
  | "Strong Hire"
  | "Hire"
  | "Maybe"
  | "No Hire"
  | "Needs More Info";

// ==================== Shared Sub-Types ====================

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface WorkExperienceEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  year: string;
}

// ==================== SSE Event Payloads ====================

/** Shape of the `scoring` SSE event from POST /analyze */
export interface SSEScoringPayload {
  overallScore: number;
  scores: {
    atsCompatibility: number;
    contentQuality: number;
    impact: number;
    readability: number;
  };
  experienceLevel: ExperienceLevel;
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
    education: EducationEntry[];
    workExperiences: WorkExperienceEntry[];
    projects: ProjectEntry[];
    certifications: CertificationEntry[];
  };
  atsCompatibility: {
    score: number;
    issues: string[];
  };
}

/** Shape of the `feedback` SSE event from POST /analyze */
export interface SSEFeedbackPayload {
  feedback: {
    summary: string;
    hiringRecommendation: HiringRecommendation;
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

/** Shape of the `complete` SSE event from POST /analyze */
export interface SSECompletePayload extends SSEScoringPayload, SSEFeedbackPayload {
  metadata: {
    analyzedAt: string;
    analysisVersion: string;
  };
  analysisId?: string;
  isGuest?: boolean;
  guestId?: string;
  remainingAnalyses?: number;
  message?: string | null;
}

// ==================== History API ====================

/** Snake-case composite from GET /history */
export interface AnalysisCompositeResponse {
  analysis: {
    id: string;
    created_at: string;
  };
  metrics: {
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
  };
  parsedData: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    experience_level: string | null;
    total_experience_years: number | null;
    technical_skills: string[];
    soft_skills: string[];
    job_titles: string[];
    education: EducationEntry[];
    work_experiences: WorkExperienceEntry[];
    projects: ProjectEntry[];
    certifications: CertificationEntry[];
  };
  feedback: {
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
  };
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface HistoryListResponse {
  data: AnalysisCompositeResponse[];
  metadata: {
    pagination: PaginationInfo;
  };
}

// ==================== Analytics API ====================

export interface HistorySummaryResponse {
  total_analyses: number;
  average_overall_score: number;
  average_ats_score: number;
  average_content_quality_score: number;
  average_impact_score: number;
  average_readability_score: number;
  latest_analysis: string | null;
  score_trend: {
    date: string;
    overall_score: number;
  }[];
}

export interface SkillTrendResponse {
  skill: string;
  frequency: number;
}

export interface ExperienceProgressionResponse {
  date: string;
  experience_level: string;
}

// ==================== Request Payloads ====================

// ==================== Extraction SSE Payloads ====================

export interface SSEExtractionProgress {
  sectionName: string;
  index: number;
  total: number;
}

export interface SSEExtractionSectionCoverage {
  required: { name: string; present: boolean }[];
  recommended: { name: string; present: boolean }[];
  optional: { name: string; present: boolean }[];
}

export interface SSEExtractionCompletePayload {
  document: {
    contact: {
      fullName: string | null;
      email: string | null;
      phone: string | null;
      location: string | null;
      linkedin: string | null;
      github: string | null;
      portfolio: string | null;
    };
    sections: Array<{
      id: string;
      type: "experience" | "text" | "list" | "table" | "raw";
      title: string;
      displayOrder: number;
      items: Array<{
        id: string;
        heading?: string;
        subheading?: string;
        dateRange?: string;
        description?: string;
        bullets?: string[];
        items?: string[];
        rows?: Record<string, string>[];
        rawText?: string;
      }>;
    }>;
    detectedProfession: string;
    detectedCareerLevel: string;
  };
  profession: { professionId: string; confidence: number };
  careerLevel: { levelId: string; label: string; totalMonths: number };
  sectionCoverage: SSEExtractionSectionCoverage;
  analysisId?: string;
}
