import { describe, it, expect } from "vitest";
import { computeDeterministicMetrics } from "../stage2_metrics.js";
import type {
  ResumeDocument,
  DynamicSection,
  SectionItem,
} from "@resumetra/shared";
import type { ProfessionKnowledgeBase } from "../../knowledge/types.js";
import type { ExtractionResult } from "../../services/pipelineService.js";
import { genericKB } from "../../knowledge/generic.js";

const testKB: ProfessionKnowledgeBase = {
  ...genericKB,
  actionVerbs: {
    strong: ["Led", "Developed", "Built", "Improved", "Managed"],
    weak: ["Helped", "Assisted"],
  },
  metricPatterns: ["\\d+%", "\\$\\d+[KMB]?"],
};

type CoveragePair = { name: string; present: boolean };

function makeCoverage(
  required: CoveragePair[] = [{ name: "contact", present: true }],
  recommended: CoveragePair[] = [],
  optional: CoveragePair[] = [],
): ExtractionResult["sectionCoverage"] {
  return { required, recommended, optional };
}

function makeSection(
  overrides: Partial<DynamicSection>,
): DynamicSection {
  return {
    id: overrides.id ?? "section-0",
    type: overrides.type ?? "experience",
    title: overrides.title ?? "Experience",
    displayOrder: overrides.displayOrder ?? 0,
    items: overrides.items ?? [],
  };
}

function makeItem(overrides: Partial<SectionItem>): SectionItem {
  return {
    id: overrides.id ?? "item-0",
    heading: overrides.heading,
    subheading: overrides.subheading,
    dateRange: overrides.dateRange,
    description: overrides.description,
    bullets: overrides.bullets,
    items: overrides.items,
    rows: overrides.rows,
    rawText: overrides.rawText,
  };
}

function makeDocument(sections: DynamicSection[]): ResumeDocument {
  return {
    contact: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      portfolio: null,
    },
    sections,
    detectedProfession: "generic",
    detectedCareerLevel: "mid",
  };
}

describe("computeDeterministicMetrics", () => {
  describe("word count", () => {
    it("counts words across all text fields", () => {
      const doc = makeDocument([
        makeSection({
          title: "Experience",
          items: [
            makeItem({
              heading: "Software Engineer",
              description: "Built scalable systems",
              bullets: ["Led team of five engineers", "Improved API latency by 50%"],
            }),
          ],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it("returns 0 for section with no text content", () => {
      const doc = makeDocument([makeSection({ title: "", items: [] })]);
      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.wordCount).toBe(0);
    });
  });

  describe("bullet metrics", () => {
    it("counts total bullets across all sections", () => {
      const doc = makeDocument([
        makeSection({
          items: [
            makeItem({ bullets: ["Led team", "Built system"] }),
            makeItem({ bullets: ["Improved speed"] }),
          ],
        }),
        makeSection({
          type: "list",
          title: "Skills",
          items: [makeItem({ bullets: ["Python", "TypeScript"] })],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.bulletCount).toBe(5);
    });

    it("computes average bullet word count", () => {
      const doc = makeDocument([
        makeSection({
          items: [
            makeItem({ bullets: ["Led team of five engineers", "Built system"] }),
          ],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.avgBulletWordCount).toBe(3.5);
    });

    it("returns 0 avgBulletWordCount when no bullets exist", () => {
      const doc = makeDocument([
        makeSection({ items: [makeItem({ description: "Some text" })] }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.bulletCount).toBe(0);
      expect(result.avgBulletWordCount).toBe(0);
    });
  });

  describe("action verb detection", () => {
    it("counts bullets starting with strong action verbs from KB", () => {
      const doc = makeDocument([
        makeSection({
          items: [
            makeItem({
              bullets: [
                "Led team of engineers",
                "Built microservices",
                "Wrote documentation",
              ],
            }),
          ],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.bulletsWithActionVerb).toBe(2);
    });

    it("matches action verbs case-insensitively", () => {
      const doc = makeDocument([
        makeSection({
          items: [
            makeItem({
              bullets: ["led the team", "BUILT the system"],
            }),
          ],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.bulletsWithActionVerb).toBe(2);
    });
  });

  describe("metric presence", () => {
    it("counts bullets containing quantified metrics", () => {
      const doc = makeDocument([
        makeSection({
          items: [
            makeItem({
              bullets: [
                "Improved latency by 50%",
                "Built new feature",
                "Generated $500K revenue",
              ],
            }),
          ],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.bulletsWithMetric).toBe(2);
    });
  });

  describe("section coverage", () => {
    it("derives sectionsPresent from coverage data", () => {
      const coverage = makeCoverage(
        [{ name: "contact", present: true }],
        [
          { name: "experience", present: true },
          { name: "skills", present: false },
        ],
        [{ name: "summary", present: true }],
      );

      const doc = makeDocument([]);
      const result = computeDeterministicMetrics(doc, testKB, coverage);

      expect(result.sectionsPresent).toContain("contact");
      expect(result.sectionsPresent).toContain("experience");
      expect(result.sectionsPresent).toContain("summary");
    });

    it("derives sectionsMissing from coverage data", () => {
      const coverage = makeCoverage(
        [{ name: "contact", present: true }],
        [
          { name: "experience", present: true },
          { name: "skills", present: false },
        ],
        [{ name: "summary", present: false }],
      );

      const doc = makeDocument([]);
      const result = computeDeterministicMetrics(doc, testKB, coverage);

      expect(result.sectionsMissing).toContain("skills");
      expect(result.sectionsMissing).toContain("summary");
      expect(result.sectionsMissing).not.toContain("contact");
    });
  });

  describe("formatting issues", () => {
    it("flags table sections as high severity issue", () => {
      const doc = makeDocument([
        makeSection({
          type: "table",
          title: "Experience",
          items: [
            makeItem({
              rows: [{ company: "Google", role: "Engineer" }],
            }),
          ],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      const tableIssue = result.formattingIssues.find(
        (i) => i.type === "table_section",
      );

      expect(tableIssue).toBeDefined();
      expect(tableIssue!.severity).toBe("high");
      expect(tableIssue!.location).toContain("Experience");
    });

    it("returns empty issues for well-formatted document", () => {
      const doc = makeDocument([
        makeSection({
          type: "experience",
          items: [makeItem({ bullets: ["Led team of engineers"] })],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.formattingIssues).toHaveLength(0);
    });
  });

  describe("keyword frequency", () => {
    it("computes word frequency excluding stop words", () => {
      const doc = makeDocument([
        makeSection({
          items: [
            makeItem({
              bullets: ["Led engineering team", "Built engineering platform"],
            }),
          ],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());

      expect(result.keywordFrequency["engineering"]).toBe(2);
      expect(result.keywordFrequency["led"]).toBe(1);
      expect(result.keywordFrequency["built"]).toBe(1);
      expect(result.keywordFrequency["of"]).toBeUndefined();
    });

    it("excludes short words from frequency", () => {
      const doc = makeDocument([
        makeSection({
          items: [makeItem({ description: "I am a developer" })],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.keywordFrequency["i"]).toBeUndefined();
      expect(result.keywordFrequency["am"]).toBeUndefined();
    });
  });

  describe("per-section metrics", () => {
    it("computes individual metrics for each section", () => {
      const doc = makeDocument([
        makeSection({
          id: "exp-1",
          title: "Experience",
          items: [
            makeItem({
              heading: "Engineer",
              bullets: ["Led team", "Built system", "Improved speed by 30%"],
            }),
          ],
        }),
        makeSection({
          id: "skills-1",
          type: "list",
          title: "Skills",
          displayOrder: 1,
          items: [makeItem({ items: ["Python", "TypeScript"] })],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());

      expect(result.perSection).toHaveLength(2);

      const expMetrics = result.perSection.find((s) => s.sectionId === "exp-1");
      expect(expMetrics).toBeDefined();
      expect(expMetrics!.title).toBe("Experience");
      expect(expMetrics!.bulletCount).toBe(3);
      expect(expMetrics!.bulletsWithActionVerb).toBe(3);
      expect(expMetrics!.bulletsWithMetric).toBe(1);

      const skillsMetrics = result.perSection.find(
        (s) => s.sectionId === "skills-1",
      );
      expect(skillsMetrics).toBeDefined();
      expect(skillsMetrics!.bulletCount).toBe(0);
    });
  });

  describe("career level and experience", () => {
    it("uses document.detectedCareerLevel for careerLevelDetected", () => {
      const doc = makeDocument([]);
      doc.detectedCareerLevel = "senior";

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.careerLevelDetected).toBe("senior");
    });

    it("computes total experience months from date ranges", () => {
      const doc = makeDocument([
        makeSection({
          type: "experience",
          items: [
            makeItem({ dateRange: "2020 - 2023" }),
            makeItem({ dateRange: "2023 - 2025" }),
          ],
        }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.totalExperienceMonths).toBe(60);
    });

    it("returns 0 totalExperienceMonths when no experience sections", () => {
      const doc = makeDocument([
        makeSection({ type: "list", title: "Skills", items: [] }),
      ]);

      const result = computeDeterministicMetrics(doc, testKB, makeCoverage());
      expect(result.totalExperienceMonths).toBe(0);
    });
  });

  describe("determinism", () => {
    it("produces identical output given same input", () => {
      const doc = makeDocument([
        makeSection({
          items: [
            makeItem({
              heading: "Developer",
              bullets: ["Led projects", "Improved speed by 40%"],
              dateRange: "2020 - 2023",
            }),
          ],
        }),
      ]);
      const coverage = makeCoverage();

      const result1 = computeDeterministicMetrics(doc, testKB, coverage);
      const result2 = computeDeterministicMetrics(doc, testKB, coverage);

      expect(result1).toEqual(result2);
    });
  });
});
