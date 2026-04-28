import { z } from "zod";

// --- Interfaces ---

export interface CareerLevel {
  id: string;
  label: string;
  experienceRange: string;
  detectionHints: string[];
  requiredSections: string[];
  recommendedSections: string[];
  optionalSections: string[];
  irrelevantSections: string[];
  resumeLength: { target: number; maximum: number };
  sectionWeights: Record<string, number>;
}

export interface SectionStandard {
  bulletFormula: string;
  bulletCountRange: [number, number];
  requiredElements: string[];
  forbiddenPatterns: string[];
  qualityIndicators: string[];
}

export interface AtsRule {
  id: string;
  description: string;
  severity: "high" | "medium" | "low";
  check: string;
  userMessage: string;
}

export interface RedFlag {
  id: string;
  pattern: string;
  severity: "high" | "medium" | "low";
  userMessage: string;
  suggestion: string;
}

export interface LearningPath {
  courses: string[];
  projects: string[];
  timeline: string;
  resumeBulletExample: string;
}

export interface ProfessionKnowledgeBase {
  professionId: string;
  displayName: string;
  aliases: string[];
  careerLevels: CareerLevel[];
  sectionStandards: Record<string, SectionStandard>;
  atsRules: AtsRule[];
  actionVerbs: { strong: string[]; weak: string[] };
  metricPatterns: string[];
  redFlags: RedFlag[];
  skillCategories: Record<string, { examples: string[]; atsWeight: number }>;
  keyRecruiterSignals: string[];
  commonJobTitles: string[];
  commonKeywords: string[];
  learningResources: Record<string, LearningPath>;
}

// --- Zod Schemas ---

export const resumeLengthSchema = z.object({
  target: z.number().int().positive(),
  maximum: z.number().int().positive(),
});

export const careerLevelSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  experienceRange: z.string().min(1),
  detectionHints: z.array(z.string()),
  requiredSections: z.array(z.string()),
  recommendedSections: z.array(z.string()),
  optionalSections: z.array(z.string()),
  irrelevantSections: z.array(z.string()),
  resumeLength: resumeLengthSchema,
  sectionWeights: z.record(z.string(), z.number()),
});

export const sectionStandardSchema = z.object({
  bulletFormula: z.string().min(1),
  bulletCountRange: z.tuple([z.number().int().min(0), z.number().int().min(0)]),
  requiredElements: z.array(z.string()),
  forbiddenPatterns: z.array(z.string()),
  qualityIndicators: z.array(z.string()),
});

export const atsRuleSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(["high", "medium", "low"]),
  check: z.string().min(1),
  userMessage: z.string().min(1),
});

export const redFlagSchema = z.object({
  id: z.string().min(1),
  pattern: z.string().min(1),
  severity: z.enum(["high", "medium", "low"]),
  userMessage: z.string().min(1),
  suggestion: z.string().min(1),
});

export const learningPathSchema = z.object({
  courses: z.array(z.string()),
  projects: z.array(z.string()),
  timeline: z.string().min(1),
  resumeBulletExample: z.string().min(1),
});

export const professionKnowledgeBaseSchema = z.object({
  professionId: z.string().min(1),
  displayName: z.string().min(1),
  aliases: z.array(z.string()),
  careerLevels: z.array(careerLevelSchema).min(1),
  sectionStandards: z.record(z.string(), sectionStandardSchema),
  atsRules: z.array(atsRuleSchema),
  actionVerbs: z.object({
    strong: z.array(z.string()),
    weak: z.array(z.string()),
  }),
  metricPatterns: z.array(z.string()),
  redFlags: z.array(redFlagSchema),
  skillCategories: z.record(
    z.string(),
    z.object({
      examples: z.array(z.string()),
      atsWeight: z.number().min(0).max(1),
    })
  ),
  keyRecruiterSignals: z.array(z.string()),
  commonJobTitles: z.array(z.string()),
  commonKeywords: z.array(z.string()),
  learningResources: z.record(z.string(), learningPathSchema),
});
