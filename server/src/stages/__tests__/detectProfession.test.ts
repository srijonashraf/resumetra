import { describe, it, expect } from "vitest";
import { detectProfession } from "../detectProfession.js";
import type { DynamicSection } from "@resumetra/shared";

const SWE_SECTIONS: DynamicSection[] = [
  {
    id: "section-0",
    type: "text",
    title: "Summary",
    displayOrder: 0,
    items: [
      { id: "item-0", description: "Senior Software Engineer with 8 years of experience" },
    ],
  },
  {
    id: "section-1",
    type: "experience",
    title: "Experience",
    displayOrder: 1,
    items: [
      {
        id: "item-1",
        heading: "Google",
        subheading: "Senior Software Engineer",
        dateRange: "2020 – Present",
        bullets: ["Led team of 8 engineers", "Reduced latency by 40%"],
      },
      {
        id: "item-2",
        heading: "Meta",
        subheading: "Software Engineer",
        dateRange: "2018 – 2020",
        bullets: ["Built microservices", "Deployed to Kubernetes"],
      },
    ],
  },
  {
    id: "section-2",
    type: "list",
    title: "Skills",
    displayOrder: 2,
    items: [
      { id: "item-3", heading: "Languages", items: ["Python", "TypeScript", "Go", "Java"] },
      { id: "item-4", heading: "Frameworks", items: ["React", "Node.js", "FastAPI"] },
    ],
  },
  {
    id: "section-3",
    type: "table",
    title: "Education",
    displayOrder: 3,
    items: [
      {
        id: "item-5",
        rows: [{ degree: "B.S. Computer Science", institution: "MIT", year: "2016" }],
      },
    ],
  },
];

const GENERIC_SECTIONS: DynamicSection[] = [
  {
    id: "section-0",
    type: "text",
    title: "Profile",
    displayOrder: 0,
    items: [
      { id: "item-0", description: "Marketing manager with brand strategy expertise" },
    ],
  },
  {
    id: "section-1",
    type: "experience",
    title: "Work History",
    displayOrder: 1,
    items: [
      {
        id: "item-1",
        heading: "Acme Corp",
        subheading: "Marketing Manager",
        dateRange: "2019 – Present",
        bullets: ["Managed brand campaigns", "Grew social media following"],
      },
    ],
  },
];

const EMPTY_SECTIONS: DynamicSection[] = [];

describe("detectProfession", () => {
  it("detects software engineer from SWE resume", () => {
    const result = detectProfession(SWE_SECTIONS);
    expect(result.professionId).toBe("software_engineer");
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("returns generic for non-SWE resume", () => {
    const result = detectProfession(GENERIC_SECTIONS);
    expect(result.professionId).toBe("generic");
  });

  it("returns generic for empty sections", () => {
    const result = detectProfession(EMPTY_SECTIONS);
    expect(result.professionId).toBe("generic");
  });

  it("returns confidence between 0 and 1", () => {
    const result = detectProfession(SWE_SECTIONS);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});
