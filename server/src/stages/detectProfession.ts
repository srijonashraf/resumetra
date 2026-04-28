import type { DynamicSection } from "@resumetra/shared";
import type { ProfessionKnowledgeBase } from "../knowledge/types.js";
import { getKnowledgeBase } from "../knowledge/registry.js";

export interface ProfessionDetectionResult {
  professionId: string;
  confidence: number;
}

const CANDIDATE_IDS = ["software_engineer"];
const CONFIDENCE_THRESHOLD = 0.7;

export function detectProfession(
  sections: DynamicSection[],
): ProfessionDetectionResult {
  let bestMatch: ProfessionDetectionResult = {
    professionId: "generic",
    confidence: 0,
  };

  for (const id of CANDIDATE_IDS) {
    const kb = getKnowledgeBase(id);
    const score = scoreProfession(sections, kb);
    if (score > bestMatch.confidence) {
      bestMatch = { professionId: id, confidence: score };
    }
  }

  if (bestMatch.confidence >= CONFIDENCE_THRESHOLD) {
    return bestMatch;
  }

  return { professionId: "generic", confidence: 0 };
}

function scoreProfession(
  sections: DynamicSection[],
  kb: ProfessionKnowledgeBase,
): number {
  const allText = sections
    .flatMap((s) => {
      const parts: string[] = [s.title];
      for (const item of s.items) {
        if (item.heading) parts.push(item.heading);
        if (item.subheading) parts.push(item.subheading);
        if (item.description) parts.push(item.description);
        if (item.bullets) parts.push(...item.bullets);
        if (item.items) parts.push(...item.items);
        if (item.rawText) parts.push(item.rawText);
      }
      return parts;
    })
    .join(" ")
    .toLowerCase();

  // Score 1: Job title match (50%)
  // Any single match is a strong signal; saturates at 2 matches.
  const titleMatches = kb.commonJobTitles.filter((title) => {
    const lower = title.toLowerCase();
    return sections.some((s) =>
      s.items.some(
        (item) =>
          (item.heading && item.heading.toLowerCase().includes(lower)) ||
          (item.subheading &&
            item.subheading.toLowerCase().includes(lower)),
      ),
    );
  }).length;
  const titleScore = Math.min(titleMatches / 2, 1);

  // Score 2: Alias/keyword match (30%)
  // Substring match against the full resume text (handles multi-word keywords).
  const allKeywords = [...kb.aliases, ...kb.commonKeywords];
  const keywordMatches = allKeywords.filter((kw) =>
    allText.includes(kw.toLowerCase()),
  ).length;
  // Need at least 20% of keywords to saturate; otherwise scale linearly.
  const keywordThreshold = Math.max(Math.ceil(allKeywords.length * 0.2), 3);
  const keywordScore =
    allKeywords.length > 0
      ? Math.min(keywordMatches / keywordThreshold, 1)
      : 0;

  // Score 3: Section structure match (20%)
  // Aggregate expected sections across all career levels for broader matching.
  const sectionTitles = sections.map((s) => s.title.toLowerCase());
  const expectedSections = new Set<string>();
  for (const level of kb.careerLevels) {
    for (const s of level.requiredSections) expectedSections.add(s);
    for (const s of level.recommendedSections) expectedSections.add(s);
  }
  const expectedList = [...expectedSections];
  const sectionMatches = expectedList.filter((rs) =>
    sectionTitles.some((st) => st.includes(rs)),
  ).length;
  const sectionScore =
    expectedList.length > 0 ? sectionMatches / expectedList.length : 0;

  return titleScore * 0.5 + keywordScore * 0.3 + sectionScore * 0.2;
}
