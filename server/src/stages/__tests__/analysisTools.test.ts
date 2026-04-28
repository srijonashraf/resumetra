import { describe, it, expect } from "vitest";
import {
  extractJdKeywordsTool,
  extractJdKeywordsResponseSchema,
  scoreSectionTool,
  scoreSectionResponseSchema,
  flagIssueTool,
  flagIssueResponseSchema,
  assessReadabilityTool,
  assessReadabilityResponseSchema,
  allAnalysisTools,
} from "../analysisTools.js";

// ── extract_jd_keywords ──────────────────────────────────────

describe("extract_jd_keywords tool", () => {
  it("has correct tool definition shape", () => {
    expect(extractJdKeywordsTool.type).toBe("function");
    expect(extractJdKeywordsTool.function.name).toBe("extract_jd_keywords");
    expect(extractJdKeywordsTool.function.parameters).toBeDefined();
  });

  it("validates a complete response", () => {
    const response = {
      skills: ["Python", "TypeScript", "AWS"],
      tools: ["React", "Docker", "Kubernetes"],
      requirements: ["5+ years experience", "Bachelor's degree"],
      softSkills: ["Leadership", "Communication"],
    };
    expect(
      extractJdKeywordsResponseSchema.safeParse(response).success,
    ).toBe(true);
  });

  it("validates a minimal response with empty arrays", () => {
    const response = {
      skills: [],
      tools: [],
      requirements: [],
      softSkills: [],
    };
    expect(
      extractJdKeywordsResponseSchema.safeParse(response).success,
    ).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(
      extractJdKeywordsResponseSchema.safeParse({ skills: ["Python"] })
        .success,
    ).toBe(false);
  });
});

// ── score_section ────────────────────────────────────────────

describe("score_section tool", () => {
  it("has correct tool definition shape", () => {
    expect(scoreSectionTool.type).toBe("function");
    expect(scoreSectionTool.function.name).toBe("score_section");
  });

  it("validates a correct response", () => {
    const response = {
      sectionId: "section-0",
      contentScore: 7.5,
      impactScore: 6.0,
    };
    expect(scoreSectionResponseSchema.safeParse(response).success).toBe(true);
  });

  it("accepts boundary scores (0 and 10)", () => {
    const response = {
      sectionId: "section-0",
      contentScore: 0,
      impactScore: 10,
    };
    expect(scoreSectionResponseSchema.safeParse(response).success).toBe(true);
  });

  it("rejects scores above 10", () => {
    const response = {
      sectionId: "section-0",
      contentScore: 11,
      impactScore: 5,
    };
    expect(scoreSectionResponseSchema.safeParse(response).success).toBe(false);
  });

  it("rejects negative scores", () => {
    const response = {
      sectionId: "section-0",
      contentScore: -1,
      impactScore: 5,
    };
    expect(scoreSectionResponseSchema.safeParse(response).success).toBe(false);
  });

  it("rejects missing sectionId", () => {
    expect(
      scoreSectionResponseSchema.safeParse({ contentScore: 5, impactScore: 5 })
        .success,
    ).toBe(false);
  });
});

// ── flag_issue ───────────────────────────────────────────────

describe("flag_issue tool", () => {
  it("has correct tool definition shape", () => {
    expect(flagIssueTool.type).toBe("function");
    expect(flagIssueTool.function.name).toBe("flag_issue");
  });

  it("validates a correct response", () => {
    const response = {
      sectionId: "section-0",
      itemId: "item-0-1",
      type: "weak_verb",
      severity: "medium",
      description: "Bullet uses a weak action verb",
      suggestion: 'Replace "Helped" with a stronger verb like "Spearheaded"',
    };
    expect(flagIssueResponseSchema.safeParse(response).success).toBe(true);
  });

  it("accepts null itemId for section-level issues", () => {
    const response = {
      sectionId: "section-0",
      itemId: null,
      type: "missing_dates",
      severity: "high",
      description: "Experience entry missing date range",
      suggestion: "Add date range for each position",
    };
    expect(flagIssueResponseSchema.safeParse(response).success).toBe(true);
  });

  it("rejects invalid severity", () => {
    const response = {
      sectionId: "section-0",
      itemId: null,
      type: "test",
      severity: "critical",
      description: "Test",
      suggestion: "Fix it",
    };
    expect(flagIssueResponseSchema.safeParse(response).success).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(
      flagIssueResponseSchema.safeParse({
        sectionId: "section-0",
        type: "test",
      }).success,
    ).toBe(false);
  });
});

// ── assess_readability ───────────────────────────────────────

describe("assess_readability tool", () => {
  it("has correct tool definition shape", () => {
    expect(assessReadabilityTool.type).toBe("function");
    expect(assessReadabilityTool.function.name).toBe("assess_readability");
  });

  it("validates a correct response", () => {
    const response = {
      score: 7.5,
      issues: [
        {
          itemId: null,
          type: "jargon",
          severity: "low",
          description: "Excessive use of industry jargon",
          suggestion: "Simplify language for broader audience",
        },
      ],
    };
    expect(
      assessReadabilityResponseSchema.safeParse(response).success,
    ).toBe(true);
  });

  it("validates response with no issues", () => {
    const response = {
      score: 9.0,
      issues: [],
    };
    expect(
      assessReadabilityResponseSchema.safeParse(response).success,
    ).toBe(true);
  });

  it("rejects score above 10", () => {
    const response = { score: 11, issues: [] };
    expect(
      assessReadabilityResponseSchema.safeParse(response).success,
    ).toBe(false);
  });

  it("rejects negative score", () => {
    const response = { score: -1, issues: [] };
    expect(
      assessReadabilityResponseSchema.safeParse(response).success,
    ).toBe(false);
  });

  it("rejects missing issues array", () => {
    expect(
      assessReadabilityResponseSchema.safeParse({ score: 5 }).success,
    ).toBe(false);
  });
});

// ── allAnalysisTools export ──────────────────────────────────

describe("allAnalysisTools export", () => {
  it("contains all 4 analysis tools", () => {
    expect(allAnalysisTools).toHaveLength(4);
    const names = allAnalysisTools.map((t) => t.function.name);
    expect(names).toContain("extract_jd_keywords");
    expect(names).toContain("score_section");
    expect(names).toContain("flag_issue");
    expect(names).toContain("assess_readability");
  });
});
