import { create } from "zustand";

export interface ResumeData {
  file: File | null;
  rawText: string;
}

export interface AnalysisResult {
  analysisId?: string;
  overallScore: number;
  scores: {
    /** 0–10 scale (derived from atsCompatibility.score / 10). Used by radar chart. */
    atsCompatibility: number;
    contentQuality: number;
    impact: number;
    readability: number;
  };
  experienceLevel:
    | "Entry-Level"
    | "Junior"
    | "Mid-Level"
    | "Senior"
    | "Lead/Principal"
    | "Executive";
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
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      year: string;
    }>;
    workExperiences: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      year: string;
    }>;
  };
  feedback: {
    summary: string;
    hiringRecommendation:
      | "Strong Hire"
      | "Hire"
      | "Maybe"
      | "No Hire"
      | "Needs More Info";
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
  atsCompatibility: {
    /** 0–100 scale. Used by progress bar. scores.atsCompatibility = this / 10 */
    score: number;
    issues: string[];
  };
  metadata?: {
    analyzedAt: string;
    analysisVersion: string;
  };
  isGuest?: boolean;
  guestId?: string;
  remainingAnalyses?: number;
  message?: string;
}

export interface JobMatchResult {
  matchPercentage: number;
  matchLevel: "Poor" | "Fair" | "Good" | "Excellent";
  missingSkills: {
    critical: string[];
    important: string[];
    nice_to_have: string[];
  };
  presentSkills: {
    exact_matches: string[];
    partial_matches: string[];
    transferable_skills: string[];
  };
  suggestions: {
    priority: "High" | "Medium" | "Low";
    category: string;
    action: string;
  }[];
  keyword_analysis: {
    total_keywords: number;
    matched_keywords: number;
    missing_keywords: string[];
  };
  experience_gap: {
    required_years: number;
    candidate_years: number;
    gap: number;
    assessment: string;
  };
  recommendation: string;
  metadata?: {
    analyzedAt: string;
  };
}

export interface CareerPathStep {
  role: string;
  status: "current" | "future" | "goal";
  skills_needed?: string[];
  timeframe?: string;
  salary_range?: string;
}

export interface CareerPath {
  name: string;
  description: string;
  difficulty: "Low" | "Medium" | "High";
  timeToGoal: string;
  steps: CareerPathStep[];
}

export interface CareerMapResult {
  paths: CareerPath[];
  currentRole: string;
  currentSkills: string[];
  recommendations: string[];
  metadata?: {
    generatedAt: string;
  };
}

export interface TailorSection {
  name: string;
  priority: "High" | "Medium" | "Low";
  before: string;
  after: string;
  changes: string[];
  keywords_added: string[];
}

export interface TailorResult {
  sections: TailorSection[];
  overall_strategy: string;
  keywords_to_add: string[];
  keywords_already_present: string[];
  ats_improvement: {
    before_score: number;
    after_score: number;
  };
}

export interface AnalysisHistoryEntry {
  id: string;
  date: Date;
  resumeData: ResumeData;
  analysisResults: AnalysisResult;
  jobMatchResults?: JobMatchResult;
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

export interface SkillGapTrend {
  skill: string;
  frequency: number;
}

interface StoreState {
  resumeData: ResumeData | null;
  analysisResults: AnalysisResult | null;
  analysisPhase: "idle" | "scoring" | "feedback" | "complete";
  jobMatchResults: JobMatchResult | null;
  analysisHistory: AnalysisHistoryEntry[];
  jobDescription: string;
  isGuest: boolean;
  guestMessage: string | null;
  setResumeData: (data: ResumeData) => void;
  setAnalysisResults: (results: AnalysisResult) => void;
  setAnalysisPhase: (phase: StoreState["analysisPhase"]) => void;
  setJobMatchResults: (results: JobMatchResult) => void;
  setJobDescription: (description: string) => void;
  setAnalysisHistory: (history: AnalysisHistoryEntry[]) => void;
  addAnalysisHistory: (entry: AnalysisHistoryEntry) => void;
  clearCurrentAnalysis: () => void;
  removeFromHistory: (id: string) => void;
  setGuestMode: (isGuest: boolean, message?: string) => void;
}

const useStore = create<StoreState>()((set) => ({
  resumeData: null,
  analysisResults: null,
  analysisPhase: "idle",
  jobMatchResults: null,
  analysisHistory: [],
  jobDescription: "",
  isGuest: false,
  guestMessage: null,
  setResumeData: (data) => set({ resumeData: data }),
  setAnalysisResults: (results) => set({ analysisResults: results }),
  setAnalysisPhase: (phase) => set({ analysisPhase: phase }),
  setJobMatchResults: (results) => set({ jobMatchResults: results }),
  setJobDescription: (description) => set({ jobDescription: description }),
  setAnalysisHistory: (history) => set({ analysisHistory: history }),
  addAnalysisHistory: (entry) =>
    set((state) => ({
      analysisHistory: [entry, ...state.analysisHistory],
    })),
  clearCurrentAnalysis: () =>
    set({
      resumeData: null,
      analysisResults: null,
      analysisPhase: "idle",
      jobMatchResults: null,
      jobDescription: "",
      guestMessage: null,
    }),
  removeFromHistory: (id) =>
    set((state) => ({
      analysisHistory: state.analysisHistory.filter((entry) => entry.id !== id),
    })),
  setGuestMode: (isGuest, message) =>
    set({ isGuest, guestMessage: message || null }),
}));

export { useStore };
