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
