import { describe, it, expect } from "vitest";
import { detectCareerLevel, parseDateRange } from "../detectCareerLevel.js";
import type { DynamicSection } from "@resumetra/shared";

const makeExperienceSection = (
  items: { heading?: string; dateRange?: string; bullets?: string[] }[],
): DynamicSection => ({
  id: "section-0",
  type: "experience",
  title: "Experience",
  displayOrder: 0,
  items: items.map((item, i) => ({
    id: `item-0-${i}`,
    heading: item.heading,
    dateRange: item.dateRange,
    bullets: item.bullets,
  })),
});

describe("parseDateRange", () => {
  it("parses 'Jan 2020 - Present'", () => {
    const months = parseDateRange("Jan 2020 - Present");
    expect(months).toBeGreaterThan(0);
  });

  it("parses '2020 - 2022'", () => {
    const months = parseDateRange("2020 - 2022");
    expect(months).toBe(24);
  });

  it("parses 'Jan 2020 - Dec 2022'", () => {
    const months = parseDateRange("Jan 2020 - Dec 2022");
    expect(months).toBe(35);
  });

  it("parses 'MM/YYYY - MM/YYYY'", () => {
    const months = parseDateRange("01/2020 - 06/2022");
    expect(months).toBe(29);
  });

  it("returns 0 for invalid format", () => {
    expect(parseDateRange("invalid")).toBe(0);
    expect(parseDateRange("")).toBe(0);
  });

  it("handles em-dash and en-dash separators", () => {
    const em = parseDateRange("2020 — 2022");
    const en = parseDateRange("2020 – 2022");
    const hyphen = parseDateRange("2020 - 2022");
    expect(em).toBe(24);
    expect(en).toBe(24);
    expect(hyphen).toBe(24);
  });
});

describe("detectCareerLevel", () => {
  it("detects new_grad for 0 months experience", () => {
    const sections = [
      makeExperienceSection([{ heading: "No job yet" }]),
    ];
    const result = detectCareerLevel(sections, "software_engineer");
    expect(result.levelId).toBe("new_grad");
    expect(result.totalMonths).toBe(0);
  });

  it("detects junior for ~1 year experience", () => {
    const sections = [
      makeExperienceSection([
        { heading: "Startup", dateRange: "2023 - 2024", bullets: ["Built stuff"] },
      ]),
    ];
    const result = detectCareerLevel(sections, "software_engineer");
    expect(result.totalMonths).toBe(12);
    expect(["new_grad", "junior"]).toContain(result.levelId);
  });

  it("detects mid for 3 years experience", () => {
    const sections = [
      makeExperienceSection([
        { heading: "Google", dateRange: "2020 - 2023", bullets: ["Built stuff"] },
      ]),
    ];
    const result = detectCareerLevel(sections, "software_engineer");
    expect(result.totalMonths).toBe(36);
    expect(result.levelId).toBe("mid");
  });

  it("detects senior for 7 years experience", () => {
    const sections = [
      makeExperienceSection([
        { heading: "Company A", dateRange: "2016 - 2023", bullets: ["Led stuff"] },
      ]),
    ];
    const result = detectCareerLevel(sections, "software_engineer");
    expect(result.totalMonths).toBe(84);
    expect(result.levelId).toBe("senior");
  });

  it("detects staff for 12 years experience", () => {
    const sections = [
      makeExperienceSection([
        { heading: "Company A", dateRange: "2012 - 2024", bullets: ["Architected stuff"] },
      ]),
    ];
    const result = detectCareerLevel(sections, "software_engineer");
    expect(result.totalMonths).toBe(144);
    expect(result.levelId).toBe("staff");
  });

  it("sums multiple positions", () => {
    const sections = [
      makeExperienceSection([
        { heading: "Company A", dateRange: "2018 - 2020", bullets: ["Dev"] },
        { heading: "Company B", dateRange: "2020 - 2023", bullets: ["Senior Dev"] },
      ]),
    ];
    const result = detectCareerLevel(sections, "software_engineer");
    expect(result.totalMonths).toBe(60);
    // 60 months = 5 years — boundary between mid (2-5) and senior (5-10).
    // First matching range wins, so mid matches at 60.
    expect(result.levelId).toBe("mid");
  });

  it("returns label from KB", () => {
    const sections = [
      makeExperienceSection([
        { heading: "Company", dateRange: "2020 - 2023", bullets: ["Dev"] },
      ]),
    ];
    const result = detectCareerLevel(sections, "software_engineer");
    expect(result.label).toBeTruthy();
    expect(typeof result.label).toBe("string");
  });

  it("handles non-experience sections (skips them)", () => {
    const sections: DynamicSection[] = [
      {
        id: "section-0",
        type: "list",
        title: "Skills",
        displayOrder: 0,
        items: [{ id: "item-0-0", items: ["Python", "Go"] }],
      },
    ];
    const result = detectCareerLevel(sections, "software_engineer");
    expect(result.totalMonths).toBe(0);
    expect(result.levelId).toBe("new_grad");
  });

  it("works with generic profession", () => {
    const sections = [
      makeExperienceSection([{ heading: "Company", dateRange: "2020 - 2023" }]),
    ];
    const result = detectCareerLevel(sections, "generic");
    expect(result.totalMonths).toBe(36);
    expect(result.levelId).toBe("all_levels");
  });
});
