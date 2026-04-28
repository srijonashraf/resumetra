import type { DynamicSection } from "@resumetra/shared";
import { getKnowledgeBase } from "../knowledge/registry.js";

export interface CareerLevelResult {
  levelId: string;
  label: string;
  totalMonths: number;
}

export function detectCareerLevel(
  sections: DynamicSection[],
  professionId: string,
): CareerLevelResult {
  const totalMonths = calculateTotalMonths(sections);
  const kb = getKnowledgeBase(professionId);

  for (const level of kb.careerLevels) {
    const [minMonths, maxMonths] = parseExperienceRange(level.experienceRange);
    if (totalMonths >= minMonths && totalMonths <= maxMonths) {
      return {
        levelId: level.id,
        label: level.label,
        totalMonths,
      };
    }
  }

  // Fallback: return the highest level if over all ranges
  const lastLevel = kb.careerLevels[kb.careerLevels.length - 1];
  const [lastMin] = parseExperienceRange(lastLevel.experienceRange);
  if (totalMonths >= lastMin) {
    return {
      levelId: lastLevel.id,
      label: lastLevel.label,
      totalMonths,
    };
  }

  // Default to first level (e.g. new_grad)
  const firstLevel = kb.careerLevels[0];
  return {
    levelId: firstLevel.id,
    label: firstLevel.label,
    totalMonths,
  };
}

function calculateTotalMonths(sections: DynamicSection[]): number {
  let totalMonths = 0;

  for (const section of sections) {
    if (section.type !== "experience") continue;

    for (const item of section.items) {
      if (!item.dateRange) continue;
      const months = parseDateRange(item.dateRange);
      if (months > 0) {
        totalMonths += months;
      }
    }
  }

  return totalMonths;
}

/**
 * Parse date range string into months.
 * Supported formats:
 *   "Jan 2020 - Present" / "Jan 2020 – Present"
 *   "2020 - Present" / "2020 – Present"
 *   "Jan 2020 - Dec 2022" / "Jan 2020 – Dec 2022"
 *   "2020 - 2022" / "2020 – 2022"
 *   "MM/YYYY - MM/YYYY"
 */
export function parseDateRange(dateRange: string): number {
  const normalized = dateRange
    .replace(/[–—]/g, "-")
    .replace(/\s*-\s*/g, " - ");

  const parts = normalized.split(" - ").map((p) => p.trim());
  if (parts.length !== 2) return 0;

  const startDate = parseDate(parts[0]);
  const endDate = parseEndDate(parts[1]);

  if (!startDate || !endDate) return 0;

  const months =
    (endDate.year - startDate.year) * 12 + (endDate.month - startDate.month);
  return Math.max(0, months);
}

interface ParsedDate {
  year: number;
  month: number; // 1-12
}

const MONTH_MAP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function parseDate(str: string): ParsedDate | null {
  const trimmed = str.trim();

  // Format: "Jan 2020" or "January 2020"
  const monthYearMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const month = MONTH_MAP[monthYearMatch[1].toLowerCase()];
    if (month) {
      return { year: parseInt(monthYearMatch[2]), month };
    }
  }

  // Format: "MM/YYYY"
  const mmYyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (mmYyyyMatch) {
    return {
      year: parseInt(mmYyyyMatch[2]),
      month: parseInt(mmYyyyMatch[1]),
    };
  }

  // Format: "YYYY" (just year, assume January)
  const yearMatch = trimmed.match(/^(\d{4})$/);
  if (yearMatch) {
    return { year: parseInt(yearMatch[1]), month: 1 };
  }

  return null;
}

function parseEndDate(str: string): ParsedDate | null {
  const trimmed = str.trim().toLowerCase();

  if (["present", "current", "now", "ongoing"].includes(trimmed)) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }

  return parseDate(str);
}

/**
 * Parse experience range string like "0-1 years", "2-5 years", "10+ years".
 * Returns [minMonths, maxMonths].
 * Non-numeric ranges like "Any experience" match everything [0, Infinity].
 */
function parseExperienceRange(range: string): [number, number] {
  // "10+ years" -> [120, Infinity]
  const plusMatch = range.match(/(\d+)\+\s*years?/i);
  if (plusMatch) {
    return [parseInt(plusMatch[1]) * 12, Infinity];
  }

  // "0-1 years", "2-5 years"
  const rangeMatch = range.match(/(\d+)\s*-\s*(\d+)\s*years?/i);
  if (rangeMatch) {
    return [parseInt(rangeMatch[1]) * 12, parseInt(rangeMatch[2]) * 12];
  }

  // "X years"
  const singleMatch = range.match(/(\d+)\s*years?/i);
  if (singleMatch) {
    const months = parseInt(singleMatch[1]) * 12;
    return [months, months];
  }

  // Catch-all for non-numeric ranges like "Any experience"
  return [0, Infinity];
}
