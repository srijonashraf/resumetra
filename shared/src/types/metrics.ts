export interface FormattingIssue {
  type: string;
  severity: "high" | "medium" | "low";
  description: string;
  location?: string;
}

export interface DeterministicMetrics {
  wordCount: number;
  bulletCount: number;
  avgBulletWordCount: number;
  sectionsPresent: string[];
  sectionsMissing: string[];
  bulletsWithActionVerb: number;
  bulletsWithMetric: number;
  formattingIssues: FormattingIssue[];
  careerLevelDetected: string;
  totalExperienceMonths: number;
}

export interface PartialMatch {
  jdKeyword: string;
  resumeKeyword: string;
  similarity: number;
}

export interface AtsReport {
  matchScore: number;
  resumeKeywords: string[];
  jdKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  partialMatches: PartialMatch[];
  sectionCoverage: Record<string, boolean>;
}

// ── Analysis v2 Types ────────────────────────────────────────

export interface SectionMetric {
  sectionId: string;
  title: string;
  wordCount: number;
  bulletCount: number;
  avgBulletWordCount: number;
  bulletsWithActionVerb: number;
  bulletsWithMetric: number;
}

export interface SectionIssue {
  itemId: string | null;
  type: string;
  severity: "high" | "medium" | "low";
  description: string;
  suggestion: string;
}

export interface SectionScore {
  sectionId: string;
  contentScore: number;
  impactScore: number;
  issues: SectionIssue[];
}

export interface ReadabilityAssessment {
  score: number;
  issues: SectionIssue[];
}

export interface AnalysisResultV2 {
  deterministicMetrics: DeterministicMetrics;
  sectionMetrics: SectionMetric[];
  sectionScores: SectionScore[];
  readability: ReadabilityAssessment;
  atsReport: AtsReport | null;
  keywordFrequency: Record<string, number>;
}
