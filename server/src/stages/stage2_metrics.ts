import type {
  ResumeDocument,
  DynamicSection,
  SectionItem,
  DeterministicMetrics,
  SectionMetric,
  FormattingIssue,
} from "@resumetra/shared";
import type { ProfessionKnowledgeBase } from "../knowledge/types.js";
import type { ExtractionResult } from "../services/pipelineService.js";
import { parseDateRange } from "./detectCareerLevel.js";

export interface MetricsOutput extends DeterministicMetrics {
  perSection: SectionMetric[];
  keywordFrequency: Record<string, number>;
}

// ── Stop words for keyword frequency ─────────────────────────

const STOP_WORDS = new Set([
  // Common English
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "shall", "should", "may", "might", "must", "can", "could",
  "it", "its", "this", "that", "these", "those", "i", "you", "he", "she",
  "we", "they", "me", "him", "her", "us", "them", "my", "your", "his",
  "our", "their", "not", "no", "if", "then", "so", "up", "out", "about",
  "into", "through", "during", "before", "after", "above", "below",
  "between", "under", "over", "again", "further", "once", "all", "each",
  "few", "more", "most", "other", "some", "such", "only", "own", "same",
  "than", "too", "very", "just", "also", "now", "here", "there", "when",
  "where", "why", "how", "what", "which", "who", "whom",
  // Resume-specific
  "resume", "work", "education", "summary", "professional", "objective",
  "skills", "university", "email", "phone", "development", "management",
  "project", "team", "years", "months", "responsibilities", "achieved",
  "including", "using", "worked", "helped", "assisted", "responsible",
]);

// ── Text extraction helpers ──────────────────────────────────

function extractItemTexts(item: SectionItem): string[] {
  const texts: string[] = [];
  if (item.heading) texts.push(item.heading);
  if (item.subheading) texts.push(item.subheading);
  if (item.description) texts.push(item.description);
  if (item.bullets) texts.push(...item.bullets);
  if (item.items) texts.push(...item.items);
  if (item.rawText) texts.push(item.rawText);
  if (item.rows) {
    for (const row of item.rows) {
      texts.push(...Object.values(row));
    }
  }
  return texts;
}

function extractSectionTexts(section: DynamicSection): string[] {
  const texts: string[] = [section.title];
  for (const item of section.items) {
    texts.push(...extractItemTexts(item));
  }
  return texts;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function getBullets(section: DynamicSection): string[] {
  const bullets: string[] = [];
  for (const item of section.items) {
    if (item.bullets) {
      bullets.push(...item.bullets);
    }
  }
  return bullets;
}

// ── Action verb + metric detection ───────────────────────────

function startsWithActionVerb(
  bullet: string,
  verbs: string[],
): boolean {
  const lower = bullet.trim().toLowerCase();
  return verbs.some((verb) => lower.startsWith(verb.toLowerCase()));
}

function containsMetric(
  bullet: string,
  patterns: string[],
): boolean {
  return patterns.some((p) => new RegExp(p, "i").test(bullet));
}

// ── Formatting checks ────────────────────────────────────────

function detectFormattingIssues(
  sections: DynamicSection[],
): FormattingIssue[] {
  const issues: FormattingIssue[] = [];

  for (const section of sections) {
    if (section.type === "table") {
      issues.push({
        type: "table_section",
        severity: "high",
        description: "ATS cannot parse table layouts reliably.",
        location: section.title,
      });
    }
  }

  return issues;
}

// ── Keyword frequency ────────────────────────────────────────

function computeKeywordFrequency(
  sections: DynamicSection[],
): Record<string, number> {
  const freq: Record<string, number> = {};

  for (const section of sections) {
    const texts = extractSectionTexts(section);
    for (const text of texts) {
      const tokens = text
        .toLowerCase()
        .split(/[^a-z0-9-]+/)
        .filter((t) => t.length >= 3 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));

      for (const token of tokens) {
        freq[token] = (freq[token] ?? 0) + 1;
      }
    }
  }

  return freq;
}

// ── Total experience months ──────────────────────────────────

function computeTotalExperienceMonths(sections: DynamicSection[]): number {
  let total = 0;
  for (const section of sections) {
    if (section.type !== "experience") continue;
    for (const item of section.items) {
      if (!item.dateRange) continue;
      const months = parseDateRange(item.dateRange);
      if (months > 0) total += months;
    }
  }
  return total;
}

// ── Per-section metrics ──────────────────────────────────────

function computeSectionMetric(
  section: DynamicSection,
  strongVerbs: string[],
  metricPatterns: string[],
): SectionMetric {
  const texts = extractSectionTexts(section);
  const wordCount = texts.reduce((sum, t) => sum + countWords(t), 0);
  const bullets = getBullets(section);
  const bulletCount = bullets.length;
  const avgBulletWordCount =
    bulletCount > 0
      ? bullets.reduce((sum, b) => sum + countWords(b), 0) / bulletCount
      : 0;
  const bulletsWithActionVerb = bullets.filter((b) =>
    startsWithActionVerb(b, strongVerbs),
  ).length;
  const bulletsWithMetric = bullets.filter((b) =>
    containsMetric(b, metricPatterns),
  ).length;

  return {
    sectionId: section.id,
    title: section.title,
    wordCount,
    bulletCount,
    avgBulletWordCount,
    bulletsWithActionVerb,
    bulletsWithMetric,
  };
}

// ── Main function ────────────────────────────────────────────

export function computeDeterministicMetrics(
  document: ResumeDocument,
  kb: ProfessionKnowledgeBase,
  sectionCoverage: ExtractionResult["sectionCoverage"],
): MetricsOutput {
  const { sections } = document;
  const strongVerbs = kb.actionVerbs.strong;
  const metricPatterns = kb.metricPatterns;

  // Per-section metrics
  const perSection = sections.map((s) =>
    computeSectionMetric(s, strongVerbs, metricPatterns),
  );

  // Aggregate totals
  const wordCount = perSection.reduce((sum, s) => sum + s.wordCount, 0);
  const bulletCount = perSection.reduce((sum, s) => sum + s.bulletCount, 0);
  const totalBulletWords = sections
    .flatMap((s) => getBullets(s))
    .reduce((sum, b) => sum + countWords(b), 0);
  const avgBulletWordCount = bulletCount > 0 ? totalBulletWords / bulletCount : 0;
  const bulletsWithActionVerb = perSection.reduce(
    (sum, s) => sum + s.bulletsWithActionVerb,
    0,
  );
  const bulletsWithMetric = perSection.reduce(
    (sum, s) => sum + s.bulletsWithMetric,
    0,
  );

  // Section coverage → present/missing
  const allCoverage = [
    ...sectionCoverage.required,
    ...sectionCoverage.recommended,
    ...sectionCoverage.optional,
  ];
  const sectionsPresent = allCoverage
    .filter((c) => c.present)
    .map((c) => c.name);
  const sectionsMissing = allCoverage
    .filter((c) => !c.present)
    .map((c) => c.name);

  // Formatting issues
  const formattingIssues = detectFormattingIssues(sections);

  // Keyword frequency
  const keywordFrequency = computeKeywordFrequency(sections);

  // Career level + experience
  const careerLevelDetected = document.detectedCareerLevel;
  const totalExperienceMonths = computeTotalExperienceMonths(sections);

  return {
    wordCount,
    bulletCount,
    avgBulletWordCount,
    sectionsPresent,
    sectionsMissing,
    bulletsWithActionVerb,
    bulletsWithMetric,
    formattingIssues,
    careerLevelDetected,
    totalExperienceMonths,
    perSection,
    keywordFrequency,
  };
}
