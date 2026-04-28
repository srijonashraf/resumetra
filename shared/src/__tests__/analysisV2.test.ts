import { describe, it, expect } from "vitest";
import {
  sectionMetricSchema,
  sectionIssueSchema,
  sectionScoreSchema,
  readabilityAssessmentSchema,
  analysisResultV2Schema,
} from "@resumetra/shared";

// ── SectionMetric ─────────────────────────────────────────────

describe("sectionMetricSchema", () => {
  const valid = {
    sectionId: "section-1",
    title: "Work Experience",
    wordCount: 120,
    bulletCount: 5,
    avgBulletWordCount: 15.2,
    bulletsWithActionVerb: 3,
    bulletsWithMetric: 2,
  };

  it("accepts valid section metric", () => {
    expect(sectionMetricSchema.parse(valid)).toEqual(valid);
  });

  it("rejects missing sectionId", () => {
    const { sectionId: _, ...rest } = valid;
    expect(() => sectionMetricSchema.parse(rest)).toThrow();
  });

  it("rejects negative wordCount", () => {
    expect(() => sectionMetricSchema.parse({ ...valid, wordCount: -1 })).toThrow();
  });

  it("rejects negative bulletCount", () => {
    expect(() => sectionMetricSchema.parse({ ...valid, bulletCount: -1 })).toThrow();
  });
});

// ── SectionIssue ──────────────────────────────────────────────

describe("sectionIssueSchema", () => {
  const valid = {
    itemId: "item-1",
    type: "weak_bullet",
    severity: "medium" as const,
    description: "Bullet lacks quantifiable impact",
    suggestion: "Add a metric or percentage to demonstrate results",
  };

  it("accepts valid issue with itemId", () => {
    expect(sectionIssueSchema.parse(valid)).toEqual(valid);
  });

  it("accepts issue with null itemId", () => {
    expect(sectionIssueSchema.parse({ ...valid, itemId: null })).toEqual({
      ...valid,
      itemId: null,
    });
  });

  it("rejects invalid severity", () => {
    expect(() =>
      sectionIssueSchema.parse({ ...valid, severity: "critical" }),
    ).toThrow();
  });

  it("rejects missing suggestion", () => {
    const { suggestion: _, ...rest } = valid;
    expect(() => sectionIssueSchema.parse(rest)).toThrow();
  });
});

// ── SectionScore ──────────────────────────────────────────────

describe("sectionScoreSchema", () => {
  const valid = {
    sectionId: "section-1",
    contentScore: 7.5,
    impactScore: 6.0,
    issues: [
      {
        itemId: "item-1",
        type: "weak_bullet",
        severity: "medium" as const,
        description: "No metric",
        suggestion: "Add a number",
      },
    ],
  };

  it("accepts valid section score", () => {
    expect(sectionScoreSchema.parse(valid)).toEqual(valid);
  });

  it("accepts score with empty issues", () => {
    expect(
      sectionScoreSchema.parse({ ...valid, issues: [] }),
    ).toBeTruthy();
  });

  it("rejects contentScore above 10", () => {
    expect(() =>
      sectionScoreSchema.parse({ ...valid, contentScore: 11 }),
    ).toThrow();
  });

  it("rejects negative impactScore", () => {
    expect(() =>
      sectionScoreSchema.parse({ ...valid, impactScore: -0.5 }),
    ).toThrow();
  });
});

// ── ReadabilityAssessment ─────────────────────────────────────

describe("readabilityAssessmentSchema", () => {
  const valid = {
    score: 7.2,
    issues: [
      {
        itemId: null,
        type: "passive_voice",
        severity: "low" as const,
        description: "Passive voice detected",
        suggestion: "Use active voice for stronger impact",
      },
    ],
  };

  it("accepts valid assessment", () => {
    expect(readabilityAssessmentSchema.parse(valid)).toEqual(valid);
  });

  it("accepts score 0", () => {
    expect(
      readabilityAssessmentSchema.parse({ ...valid, score: 0 }),
    ).toBeTruthy();
  });

  it("rejects score above 10", () => {
    expect(() =>
      readabilityAssessmentSchema.parse({ ...valid, score: 10.5 }),
    ).toThrow();
  });
});

// ── AnalysisResultV2 ──────────────────────────────────────────

describe("analysisResultV2Schema", () => {
  const valid = {
    deterministicMetrics: {
      wordCount: 450,
      bulletCount: 12,
      avgBulletWordCount: 14.5,
      sectionsPresent: ["Work Experience", "Education"],
      sectionsMissing: ["Projects"],
      bulletsWithActionVerb: 8,
      bulletsWithMetric: 5,
      formattingIssues: [],
      careerLevelDetected: "mid",
      totalExperienceMonths: 48,
    },
    sectionMetrics: [
      {
        sectionId: "section-1",
        title: "Work Experience",
        wordCount: 120,
        bulletCount: 5,
        avgBulletWordCount: 15.2,
        bulletsWithActionVerb: 3,
        bulletsWithMetric: 2,
      },
    ],
    sectionScores: [
      {
        sectionId: "section-1",
        contentScore: 7.5,
        impactScore: 6.0,
        issues: [],
      },
    ],
    readability: {
      score: 7.2,
      issues: [],
    },
    atsReport: null,
    keywordFrequency: { React: 3, TypeScript: 5 },
  };

  it("accepts valid result without JD", () => {
    expect(analysisResultV2Schema.parse(valid)).toEqual(valid);
  });

  it("accepts valid result with ATS report", () => {
    const withAts = {
      ...valid,
      atsReport: {
        matchScore: 73.5,
        resumeKeywords: ["React"],
        jdKeywords: ["React", "Kubernetes"],
        matchedKeywords: ["React"],
        missingKeywords: ["Kubernetes"],
        partialMatches: [],
        sectionCoverage: { "Work Experience": true },
      },
    };
    expect(analysisResultV2Schema.parse(withAts)).toEqual(withAts);
  });

  it("rejects missing deterministicMetrics", () => {
    const { deterministicMetrics: _, ...rest } = valid;
    expect(() => analysisResultV2Schema.parse(rest)).toThrow();
  });

  it("rejects missing readability", () => {
    const { readability: _, ...rest } = valid;
    expect(() => analysisResultV2Schema.parse(rest)).toThrow();
  });

  it("accepts empty keywordFrequency", () => {
    expect(
      analysisResultV2Schema.parse({ ...valid, keywordFrequency: {} }),
    ).toBeTruthy();
  });
});
