import { z } from "zod";
import type { ToolDefinition } from "../services/aiService.js";

// ── Tool 1: extract_jd_keywords ──────────────────────────────

export const extractJdKeywordsResponseSchema = z.object({
  skills: z.array(z.string().min(1)),
  tools: z.array(z.string().min(1)),
  requirements: z.array(z.string().min(1)),
  softSkills: z.array(z.string().min(1)),
});

export const extractJdKeywordsTool: ToolDefinition = {
  type: "function",
  function: {
    name: "extract_jd_keywords",
    description:
      "Extract skills, tools, requirements, and soft skills from a job description. Returns categorized keyword lists.",
    parameters: {
      type: "object",
      properties: {
        skills: {
          type: "array",
          items: { type: "string" },
          description: "Technical skills mentioned in the job description",
        },
        tools: {
          type: "array",
          items: { type: "string" },
          description: "Software tools, platforms, or frameworks mentioned",
        },
        requirements: {
          type: "array",
          items: { type: "string" },
          description: "Explicit requirements like experience level, education, certifications",
        },
        softSkills: {
          type: "array",
          items: { type: "string" },
          description: "Soft skills and interpersonal qualities mentioned",
        },
      },
      required: ["skills", "tools", "requirements", "softSkills"],
    },
  },
};

// ── Tool 2: score_section ────────────────────────────────────

const score0to10 = z.number().min(0).max(10);

export const scoreSectionResponseSchema = z.object({
  sectionId: z.string().min(1),
  contentScore: score0to10,
  impactScore: score0to10,
});

export const scoreSectionTool: ToolDefinition = {
  type: "function",
  function: {
    name: "score_section",
    description:
      "Rate a resume section's content quality and impact on a 0-10 scale. Content score reflects clarity, completeness, and relevance. Impact score reflects quantified achievements, strong action verbs, and results-driven language.",
    parameters: {
      type: "object",
      properties: {
        sectionId: {
          type: "string",
          description: "The section ID being scored",
        },
        contentScore: {
          type: "number",
          description: "Content quality score (0-10)",
        },
        impactScore: {
          type: "number",
          description: "Impact and achievement score (0-10)",
        },
      },
      required: ["sectionId", "contentScore", "impactScore"],
    },
  },
};

// ── Tool 3: flag_issue ───────────────────────────────────────

const issueSeveritySchema = z.enum(["high", "medium", "low"]);

export const flagIssueResponseSchema = z.object({
  sectionId: z.string().min(1),
  itemId: z.string().nullable(),
  type: z.string().min(1),
  severity: issueSeveritySchema,
  description: z.string().min(1),
  suggestion: z.string().min(1),
});

export const flagIssueTool: ToolDefinition = {
  type: "function",
  function: {
    name: "flag_issue",
    description:
      "Identify a specific problem in a resume section with severity and actionable suggestion. Use for weak verbs, missing metrics, vague language, formatting issues, etc.",
    parameters: {
      type: "object",
      properties: {
        sectionId: {
          type: "string",
          description: "The section containing the issue",
        },
        itemId: {
          type: "string",
          description: "The specific item ID with the issue, or null for section-level issues",
          nullable: true,
        },
        type: {
          type: "string",
          description: "Issue category (e.g., weak_verb, missing_metric, vague_language, missing_dates)",
        },
        severity: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "How much this issue impacts resume effectiveness",
        },
        description: {
          type: "string",
          description: "What the issue is",
        },
        suggestion: {
          type: "string",
          description: "How to fix the issue",
        },
      },
      required: ["sectionId", "itemId", "type", "severity", "description", "suggestion"],
    },
  },
};

// ── Tool 4: assess_readability ───────────────────────────────

const readabilityIssueSchema = z.object({
  itemId: z.string().nullable(),
  type: z.string().min(1),
  severity: issueSeveritySchema,
  description: z.string().min(1),
  suggestion: z.string().min(1),
});

export const assessReadabilityResponseSchema = z.object({
  score: score0to10,
  issues: z.array(readabilityIssueSchema),
});

export const assessReadabilityTool: ToolDefinition = {
  type: "function",
  function: {
    name: "assess_readability",
    description:
      "Evaluate the overall readability of the resume. Consider sentence clarity, jargon usage, conciseness, tone consistency, and language quality. Return a 0-10 score with specific issues.",
    parameters: {
      type: "object",
      properties: {
        score: {
          type: "number",
          description: "Overall readability score (0-10)",
        },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              itemId: {
                type: "string",
                description: "Item ID with readability issue, or null for general",
                nullable: true,
              },
              type: {
                type: "string",
                description: "Issue category (e.g., jargon, run_on, passive_voice)",
              },
              severity: {
                type: "string",
                enum: ["high", "medium", "low"],
              },
              description: {
                type: "string",
                description: "What the readability issue is",
              },
              suggestion: {
                type: "string",
                description: "How to improve readability",
              },
            },
            required: ["itemId", "type", "severity", "description", "suggestion"],
          },
          description: "Specific readability issues found",
        },
      },
      required: ["score", "issues"],
    },
  },
};

// ── Export all ───────────────────────────────────────────────

export const allAnalysisTools: ToolDefinition[] = [
  extractJdKeywordsTool,
  scoreSectionTool,
  flagIssueTool,
  assessReadabilityTool,
];
