import { describe, it, expect } from "vitest";
import {
  contactInfoSchema,
  sectionItemSchema,
  dynamicSectionSchema,
  resumeDocumentSchema,
} from "@resumetra/shared";
import {
  rewriteSchema,
  gapClassificationSchema,
} from "@resumetra/shared";
import {
  formattingIssueSchema,
  deterministicMetricsSchema,
  partialMatchSchema,
  atsReportSchema,
} from "@resumetra/shared";

// ── ContactInfo ──────────────────────────────────────────────

describe("contactInfoSchema", () => {
  const valid = {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "+1-555-0123",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/janedoe",
    github: "https://github.com/janedoe",
    portfolio: null,
  };

  it("accepts valid contact info", () => {
    expect(contactInfoSchema.parse(valid)).toEqual(valid);
  });

  it("accepts all-null fields", () => {
    const allNull = {
      fullName: null,
      email: null,
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      portfolio: null,
    };
    expect(contactInfoSchema.parse(allNull)).toEqual(allNull);
  });

  it("rejects missing fields", () => {
    expect(() => contactInfoSchema.parse({ fullName: "Jane" })).toThrow();
  });

  it("rejects non-string values", () => {
    expect(() =>
      contactInfoSchema.parse({ ...valid, fullName: 123 }),
    ).toThrow();
  });
});

// ── SectionItem ──────────────────────────────────────────────

describe("sectionItemSchema", () => {
  const validExperienceItem = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    heading: "Acme Corp",
    subheading: "Senior Engineer",
    dateRange: "Jan 2022 – Present",
    bullets: [
      "Engineered RESTful APIs reducing response time by 85%",
      "Led team of 5 engineers",
    ],
  };

  const validListItem = {
    id: "660e8400-e29b-41d4-a716-446655440001",
    items: ["TypeScript", "React", "Node.js"],
  };

  const validTableItem = {
    id: "770e8400-e29b-41d4-a716-446655440002",
    rows: [
      { institution: "MIT", degree: "BSc", field: "CS", year: "2020" },
    ],
  };

  const validRawItem = {
    id: "880e8400-e29b-41d4-a716-446655440003",
    rawText: "Some unparsed content here",
  };

  it("accepts experience-style item with bullets", () => {
    expect(sectionItemSchema.parse(validExperienceItem)).toEqual(
      validExperienceItem,
    );
  });

  it("accepts list-style item", () => {
    expect(sectionItemSchema.parse(validListItem)).toEqual(validListItem);
  });

  it("accepts table-style item", () => {
    expect(sectionItemSchema.parse(validTableItem)).toEqual(validTableItem);
  });

  it("accepts raw text item", () => {
    expect(sectionItemSchema.parse(validRawItem)).toEqual(validRawItem);
  });

  it("accepts minimal item with only id", () => {
    expect(sectionItemSchema.parse({ id: "minimal-id" })).toEqual({
      id: "minimal-id",
    });
  });

  it("rejects missing id", () => {
    expect(() => sectionItemSchema.parse({ heading: "test" })).toThrow();
  });
});

// ── DynamicSection ───────────────────────────────────────────

describe("dynamicSectionSchema", () => {
  const valid = {
    id: "section-1",
    type: "experience" as const,
    title: "Work Experience",
    displayOrder: 1,
    items: [
      {
        id: "item-1",
        heading: "Acme Corp",
        subheading: "Engineer",
        bullets: ["Did stuff"],
      },
    ],
  };

  it("accepts valid section", () => {
    expect(dynamicSectionSchema.parse(valid)).toEqual(valid);
  });

  it("rejects invalid section type", () => {
    expect(() =>
      dynamicSectionSchema.parse({ ...valid, type: "invalid" }),
    ).toThrow();
  });

  it("rejects missing title", () => {
    expect(() => {
      const { title: _, ...rest } = valid;
      return dynamicSectionSchema.parse(rest);
    }).toThrow();
  });

  it("rejects negative displayOrder", () => {
    expect(() =>
      dynamicSectionSchema.parse({ ...valid, displayOrder: -1 }),
    ).toThrow();
  });
});

// ── ResumeDocument ───────────────────────────────────────────

describe("resumeDocumentSchema", () => {
  const valid = {
    contact: {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      portfolio: null,
    },
    sections: [
      {
        id: "section-1",
        type: "text",
        title: "Summary",
        displayOrder: 0,
        items: [
          { id: "item-1", description: "Experienced engineer" },
        ],
      },
    ],
    detectedProfession: "software_engineer",
    detectedCareerLevel: "mid",
  };

  it("accepts valid document", () => {
    expect(resumeDocumentSchema.parse(valid)).toEqual(valid);
  });

  it("accepts generic profession", () => {
    expect(
      resumeDocumentSchema.parse({
        ...valid,
        detectedProfession: "generic",
      }),
    ).toBeTruthy();
  });

  it("rejects missing contact", () => {
    const { contact: _, ...rest } = valid;
    expect(() => resumeDocumentSchema.parse(rest)).toThrow();
  });

  it("rejects empty sections array — not allowed", () => {
    // Empty sections array IS valid (thin resume scenario)
    expect(
      resumeDocumentSchema.parse({ ...valid, sections: [] }),
    ).toBeTruthy();
  });
});

// ── GapClassification ────────────────────────────────────────

describe("gapClassificationSchema", () => {
  it("accepts REWRITTEN", () => {
    expect(gapClassificationSchema.parse("REWRITTEN")).toBe("REWRITTEN");
  });
  it("accepts REFRAMED", () => {
    expect(gapClassificationSchema.parse("REFRAMED")).toBe("REFRAMED");
  });
  it("accepts MISSING", () => {
    expect(gapClassificationSchema.parse("MISSING")).toBe("MISSING");
  });
  it("rejects invalid value", () => {
    expect(() => gapClassificationSchema.parse("FABRICATED")).toThrow();
  });
});

// ── Rewrite ──────────────────────────────────────────────────

describe("rewriteSchema", () => {
  const valid = {
    id: "rewrite-1",
    sectionId: "section-1",
    itemId: "item-1",
    field: "bullets[0]",
    before: "Worked on APIs",
    after: "Engineered RESTful APIs reducing latency by 40%",
    rationale: "Added quantifiable impact metric",
    keywordsAdded: ["RESTful", "latency"],
    gapClassification: "REWRITTEN" as const,
    accepted: null,
  };

  it("accepts valid rewrite", () => {
    expect(rewriteSchema.parse(valid)).toEqual(valid);
  });

  it("accepts accepted=true", () => {
    expect(
      rewriteSchema.parse({ ...valid, accepted: true }),
    ).toBeTruthy();
  });

  it("accepts accepted=false", () => {
    expect(
      rewriteSchema.parse({ ...valid, accepted: false }),
    ).toBeTruthy();
  });

  it("rejects missing required fields", () => {
    expect(() => rewriteSchema.parse({ id: "x" })).toThrow();
  });

  it("rejects invalid gapClassification", () => {
    expect(() =>
      rewriteSchema.parse({ ...valid, gapClassification: "FAKE" }),
    ).toThrow();
  });
});

// ── FormattingIssue ──────────────────────────────────────────

describe("formattingIssueSchema", () => {
  const valid = {
    type: "two_column",
    severity: "high" as const,
    description: "Resume uses two-column layout",
    location: "Page 1",
  };

  it("accepts valid issue", () => {
    expect(formattingIssueSchema.parse(valid)).toEqual(valid);
  });

  it("accepts without location", () => {
    const { location: _, ...withoutLocation } = valid;
    expect(formattingIssueSchema.parse(withoutLocation)).toEqual(
      withoutLocation,
    );
  });

  it("rejects invalid severity", () => {
    expect(() =>
      formattingIssueSchema.parse({ ...valid, severity: "critical" }),
    ).toThrow();
  });
});

// ── DeterministicMetrics ─────────────────────────────────────

describe("deterministicMetricsSchema", () => {
  const valid = {
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
  };

  it("accepts valid metrics", () => {
    expect(deterministicMetricsSchema.parse(valid)).toEqual(valid);
  });

  it("rejects negative wordCount", () => {
    expect(() =>
      deterministicMetricsSchema.parse({ ...valid, wordCount: -1 }),
    ).toThrow();
  });

  it("rejects missing sectionsPresent", () => {
    const { sectionsPresent: _, ...rest } = valid;
    expect(() => deterministicMetricsSchema.parse(rest)).toThrow();
  });
});

// ── PartialMatch ─────────────────────────────────────────────

describe("partialMatchSchema", () => {
  it("accepts valid partial match", () => {
    const valid = {
      jdKeyword: "Kubernetes",
      resumeKeyword: "k8s",
      similarity: 0.85,
    };
    expect(partialMatchSchema.parse(valid)).toEqual(valid);
  });

  it("rejects similarity outside 0-1", () => {
    expect(() =>
      partialMatchSchema.parse({
        jdKeyword: "Kubernetes",
        resumeKeyword: "k8s",
        similarity: 1.5,
      }),
    ).toThrow();
  });
});

// ── AtsReport ────────────────────────────────────────────────

describe("atsReportSchema", () => {
  const valid = {
    matchScore: 73.5,
    resumeKeywords: ["React", "TypeScript"],
    jdKeywords: ["React", "TypeScript", "Kubernetes"],
    matchedKeywords: ["React", "TypeScript"],
    missingKeywords: ["Kubernetes"],
    partialMatches: [
      { jdKeyword: "PostgreSQL", resumeKeyword: "postgres", similarity: 0.82 },
    ],
    sectionCoverage: { "Work Experience": true, Projects: false },
  };

  it("accepts valid ATS report", () => {
    expect(atsReportSchema.parse(valid)).toEqual(valid);
  });

  it("rejects matchScore above 100", () => {
    expect(() =>
      atsReportSchema.parse({ ...valid, matchScore: 101 }),
    ).toThrow();
  });

  it("rejects negative matchScore", () => {
    expect(() =>
      atsReportSchema.parse({ ...valid, matchScore: -1 }),
    ).toThrow();
  });
});
