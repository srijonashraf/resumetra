import axios from "axios";

import { ApiError } from "./errors";

import type {
  SSEScoringPayload,
  SSEFeedbackPayload,
  SSECompletePayload,
  AnalysisCompositeResponse,
  HistoryListResponse,
  PaginationInfo,
  HistorySummaryResponse,
  SkillTrendResponse,
  ExperienceProgressionResponse,
} from "../types";

import type {
  AnalysisResult,
  AnalysisHistoryEntry,
  JobMatchResult,
  CareerMapResult,
  TailorResult,
  HistorySummary,
  SkillGapTrend,
} from "../store/useStore";

// ==================== Runtime Type Guards ====================

const VALID_EXPERIENCE_LEVELS = [
  "Entry-Level",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead/Principal",
  "Executive",
] as const;

const isValidExperienceLevel = (
  value: string | null | undefined,
): value is AnalysisResult["experienceLevel"] => {
  return value != null && VALID_EXPERIENCE_LEVELS.includes(value as AnalysisResult["experienceLevel"]);
};

function validateAnalysisComposite(
  composite: unknown,
): asserts composite is AnalysisCompositeResponse {
  if (!composite || typeof composite !== "object") {
    throw new ApiError(502, "Invalid history entry: expected object");
  }
  const record = composite as Record<string, unknown>;
  if (!record.analysis || !record.metrics || !record.parsedData || !record.feedback) {
    throw new ApiError(502, "Invalid history entry: missing required sections");
  }
}

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("Missing API URL");
}

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("resumetra_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== Auth ====================

export const googleLogin = async (idToken: string) => {
  const response = await api.post("/auth/google", { idToken });
  return response.data.data as {
    token: string;
    user: {
      id: string;
      email: string | null;
      name: string | null;
      picture: string | null;
    };
  };
};

// ==================== Resume Analysis — SSE Streaming ====================

export const analyzeResumeStream = async (
  resumeText: string,
  onScoring: (data: SSEScoringPayload) => void,
  onFeedback: (data: SSEFeedbackPayload) => void,
  options?: { sourceType?: string; originalFileName?: string },
): Promise<SSECompletePayload> => {
  const token = localStorage.getItem("resumetra_token");

  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      resumeText,
      ...(options?.sourceType ? { sourceType: options.sourceType } : {}),
      ...(options?.originalFileName ? { originalFileName: options.originalFileName } : {}),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw ApiError.fromResponse(response.status, errorData);
  }

  if (!response.body) {
    throw new ApiError(500, "No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completeResult: SSECompletePayload | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const eventBlocks = buffer.split("\n\n");
    buffer = eventBlocks.pop() || "";

    for (const block of eventBlocks) {
      if (!block.trim()) continue;

      let eventType = "";
      let eventData = "";

      for (const line of block.split("\n")) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          eventData = line.slice(6);
        }
      }

      if (!eventData) continue;

      // JSON.parse returns any — single cast at the JSON boundary
      const parsed: unknown = JSON.parse(eventData);

      switch (eventType) {
        case "scoring":
          onScoring(parsed as SSEScoringPayload);
          break;
        case "feedback":
          onFeedback(parsed as SSEFeedbackPayload);
          break;
        case "complete":
          completeResult = parsed as SSECompletePayload;
          break;
        case "error":
          throw ApiError.fromResponse(400, parsed);
      }
    }
  }

  if (!completeResult) {
    throw new ApiError(500, "Stream ended without complete event");
  }

  return completeResult;
};

// ==================== Job / Career / Tailor ====================

export const compareWithJobDescription = async (
  analysisId: string,
  jobDescription: string,
): Promise<JobMatchResult> => {
  const response = await api.post("/job-match", { analysisId, jobDescription });
  return response.data.data;
};

export const generateCareerMap = async (analysisId: string): Promise<CareerMapResult> => {
  const response = await api.post("/career-map", { analysisId });
  return response.data.data;
};

export const tailorResume = async (
  analysisId: string,
  resumeText: string,
  jobDescription: string,
): Promise<TailorResult> => {
  const response = await api.post("/tailor", { analysisId, resumeText, jobDescription });
  return response.data.data;
};

// ==================== History — Raw API ====================

const getUserHistory = async (
  limit: number = 50,
  offset: number = 0,
): Promise<HistoryListResponse> => {
  const response = await api.get<HistoryListResponse>(`/history?limit=${limit}&offset=${offset}`);
  return response.data;
};

/**
 * Transforms a snake-case AnalysisCompositeResponse into the camelCase AnalysisHistoryEntry
 * shape used by the frontend store.
 */
const transformCompositeToEntry = (
  composite: AnalysisCompositeResponse,
): AnalysisHistoryEntry => {
  const { analysis, metrics, parsedData, feedback } = composite;

  return {
    id: analysis.id,
    date: new Date(analysis.created_at),
    resumeData: {
      file: null,
      rawText: "",
    },
    analysisResults: {
      analysisId: analysis.id,
      overallScore: metrics.overall_score,
      scores: {
        atsCompatibility: Math.round((metrics.ats_compatibility_score / 100) * 10 * 10) / 10,
        contentQuality: metrics.content_quality_score,
        impact: metrics.impact_score,
        readability: metrics.readability_score,
      },
      experienceLevel: isValidExperienceLevel(parsedData.experience_level)
        ? parsedData.experience_level
        : "Mid-Level",
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
      feedback: {
        summary: feedback.summary,
        hiringRecommendation: feedback.hiring_recommendation as AnalysisResult["feedback"]["hiringRecommendation"],
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
      atsCompatibility: {
        score: metrics.ats_compatibility_score,
        issues: metrics.ats_issues,
      },
      metadata: {
        analyzedAt: analysis.created_at,
        analysisVersion: "2.0",
      },
    },
  };
};

// ==================== History — Enhanced (with transform) ====================

export const fetchUserHistory = async (
  limit: number = 50,
  offset: number = 0,
): Promise<{ data: AnalysisHistoryEntry[]; pagination: PaginationInfo }> => {
  const response = await getUserHistory(limit, offset);
  response.data.forEach(validateAnalysisComposite);

  const transformedData = response.data.map(transformCompositeToEntry);

  return {
    data: transformedData,
    pagination: response.metadata.pagination,
  };
};

export const deleteHistoryEntry = async (id: string) => {
  const response = await api.delete(`/history/${id}`);
  return response.data.data;
};

// ==================== Analytics — Raw API ====================

const getHistorySummary = async (): Promise<HistorySummaryResponse> => {
  const response = await api.get("/history/summary");
  return response.data.data;
};

const getSkillTrends = async (): Promise<SkillTrendResponse[]> => {
  const response = await api.get("/history/skill-trends");
  return response.data.data;
};

const getExperienceProgression = async (): Promise<ExperienceProgressionResponse[]> => {
  const response = await api.get("/history/progression");
  return response.data.data;
};

// ==================== Analytics — Enhanced (with transform) ====================

export const fetchHistorySummary = async (): Promise<HistorySummary> => {
  const response = await getHistorySummary();
  return {
    ...response,
    latest_analysis: response.latest_analysis
      ? new Date(response.latest_analysis)
      : null,
    score_trend: response.score_trend.map((trend) => ({
      ...trend,
      date: new Date(trend.date),
    })),
  };
};

export const fetchSkillTrends = async (): Promise<SkillGapTrend[]> => {
  return await getSkillTrends();
};

export const fetchExperienceProgression = async (): Promise<
  { date: Date; experience_level: string }[]
> => {
  const response = await getExperienceProgression();
  return response.map((item) => ({
    ...item,
    date: new Date(item.date),
  }));
};

export default api;
