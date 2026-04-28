import { describe, it, expect } from "vitest";
import { professionKnowledgeBaseSchema, getKnowledgeBase, softwareEngineerKB, genericKB } from "../knowledge/index.js";

const validKB = {
  professionId: "software_engineer",
  displayName: "Software Engineer",
  aliases: ["swe", "developer"],
  careerLevels: [
    {
      id: "new_grad",
      label: "New Graduate",
      experienceRange: "0-1 years",
      detectionHints: ["entry", "junior", "intern"],
      requiredSections: ["experience", "education"],
      recommendedSections: ["skills", "projects"],
      optionalSections: ["certifications"],
      irrelevantSections: ["publications"],
      resumeLength: { target: 1, maximum: 1 },
      sectionWeights: { education: 0.3, experience: 0.4, skills: 0.2, projects: 0.1 },
    },
  ],
  sectionStandards: {
    experience: {
      bulletFormula: "Action verb + context + metric result",
      bulletCountRange: [3, 5] as [number, number],
      requiredElements: ["action_verb", "context"],
      forbiddenPatterns: ["responsible for", "helped with"],
      qualityIndicators: ["has_metric", "has_quantifiable_result"],
    },
  },
  atsRules: [
    {
      id: "ats001",
      description: "Use standard section titles",
      severity: "high" as const,
      check: "Section titles match expected names",
      userMessage: "Rename sections to standard titles for ATS compatibility",
    },
  ],
  actionVerbs: {
    strong: ["Built", "Designed", "Led"],
    weak: ["Helped", "Assisted", "Participated"],
  },
  metricPatterns: ["\\d+%", "\\$\\d+", "\\d+x"],
  redFlags: [
    {
      id: "rf001",
      pattern: "responsible for",
      severity: "medium" as const,
      userMessage: "Avoid 'responsible for' — use action verbs",
      suggestion: "Start with 'Managed', 'Led', or 'Oversaw'",
    },
  ],
  skillCategories: {
    languages: { examples: ["JavaScript", "Python", "Go"], atsWeight: 0.3 },
  },
  keyRecruiterSignals: ["system design", "scalability", "leadership"],
  commonJobTitles: ["Software Engineer", "Senior Software Engineer"],
  commonKeywords: ["algorithms", "data structures", "system design"],
  learningResources: {},
};

describe("professionKnowledgeBaseSchema", () => {
  it("parses a valid ProfessionKnowledgeBase", () => {
    const result = professionKnowledgeBaseSchema.parse(validKB);
    expect(result.professionId).toBe("software_engineer");
    expect(result.careerLevels).toHaveLength(1);
    expect(result.careerLevels[0].id).toBe("new_grad");
  });

  it("rejects missing required fields", () => {
    const { professionId, ...missing } = validKB;
    expect(() => professionKnowledgeBaseSchema.parse(missing)).toThrow();
  });

  it("rejects wrong types", () => {
    expect(() =>
      professionKnowledgeBaseSchema.parse({ ...validKB, professionId: 123 })
    ).toThrow();
  });

  it("requires at least one career level", () => {
    expect(() =>
      professionKnowledgeBaseSchema.parse({ ...validKB, careerLevels: [] })
    ).toThrow();
  });

  it("rejects invalid severity values", () => {
    const invalid = {
      ...validKB,
      atsRules: [
        {
          id: "ats002",
          description: "test",
          severity: "critical",
          check: "test",
          userMessage: "test",
        },
      ],
    };
    expect(() => professionKnowledgeBaseSchema.parse(invalid)).toThrow();
  });
});

describe("Knowledge Base Registry", () => {
  it("returns SWE KB for software_engineer", () => {
    const kb = getKnowledgeBase("software_engineer");
    expect(kb).toBe(softwareEngineerKB);
    expect(kb.professionId).toBe("software_engineer");
  });

  it("returns generic KB for unknown profession", () => {
    const kb = getKnowledgeBase("unknown_profession");
    expect(kb).toBe(genericKB);
    expect(kb.professionId).toBe("generic");
  });

  it("returns generic KB for empty string", () => {
    const kb = getKnowledgeBase("");
    expect(kb).toBe(genericKB);
  });

  it("returns generic KB for generic id", () => {
    const kb = getKnowledgeBase("generic");
    expect(kb).toBe(genericKB);
  });

  it("SWE KB has all 5 career levels", () => {
    const kb = getKnowledgeBase("software_engineer");
    expect(kb.careerLevels).toHaveLength(5);
    expect(kb.careerLevels.map(l => l.id)).toEqual(
      expect.arrayContaining(["new_grad", "junior", "mid", "senior", "staff"])
    );
  });

  it("SWE KB has strong action verbs", () => {
    const kb = getKnowledgeBase("software_engineer");
    expect(kb.actionVerbs.strong.length).toBeGreaterThan(10);
    expect(kb.actionVerbs.weak.length).toBeGreaterThan(0);
  });

  it("SWE KB has skill categories", () => {
    const kb = getKnowledgeBase("software_engineer");
    expect(Object.keys(kb.skillCategories).length).toBeGreaterThan(0);
  });

  it("generic KB has single career level", () => {
    const kb = getKnowledgeBase("generic");
    expect(kb.careerLevels).toHaveLength(1);
    expect(kb.careerLevels[0].id).toBe("all_levels");
  });
});
