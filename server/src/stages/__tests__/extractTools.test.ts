import { describe, it, expect } from "vitest";
import {
  detectSectionsResponseSchema,
  extractContactResponseSchema,
  extractSectionResponseSchema,
  detectSectionsTool,
  extractContactTool,
  extractSectionTool,
} from "../extractTools.js";

describe("detect_sections tool", () => {
  it("has correct tool definition shape", () => {
    expect(detectSectionsTool.type).toBe("function");
    expect(detectSectionsTool.function.name).toBe("detect_sections");
    expect(detectSectionsTool.function.parameters).toBeDefined();
  });

  it("validates a correct response", () => {
    const response = {
      sections: [
        {
          title: "Experience",
          startIndex: 0,
          endIndex: 500,
          estimatedType: "experience",
        },
        {
          title: "Education",
          startIndex: 501,
          endIndex: 700,
          estimatedType: "table",
        },
      ],
    };
    expect(detectSectionsResponseSchema.safeParse(response).success).toBe(true);
  });

  it("rejects missing sections array", () => {
    expect(detectSectionsResponseSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid estimatedType", () => {
    const response = {
      sections: [
        { title: "Test", startIndex: 0, endIndex: 100, estimatedType: "invalid" },
      ],
    };
    expect(detectSectionsResponseSchema.safeParse(response).success).toBe(false);
  });
});

describe("extract_contact tool", () => {
  it("has correct tool definition shape", () => {
    expect(extractContactTool.type).toBe("function");
    expect(extractContactTool.function.name).toBe("extract_contact");
  });

  it("validates a complete contact response", () => {
    const response = {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+1-555-123-4567",
      location: "San Francisco, CA",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      portfolio: null,
    };
    expect(extractContactResponseSchema.safeParse(response).success).toBe(true);
  });

  it("validates a minimal contact response (all null)", () => {
    const response = {
      fullName: null,
      email: null,
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      portfolio: null,
    };
    expect(extractContactResponseSchema.safeParse(response).success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(
      extractContactResponseSchema.safeParse({ fullName: "John" }).success,
    ).toBe(false);
  });
});

describe("extract_section tool", () => {
  it("has correct tool definition shape", () => {
    expect(extractSectionTool.type).toBe("function");
    expect(extractSectionTool.function.name).toBe("extract_section");
  });

  it("validates an experience-type section", () => {
    const response = {
      sectionId: "section-0",
      type: "experience",
      title: "Work Experience",
      displayOrder: 0,
      items: [
        {
          heading: "Google",
          subheading: "Senior SWE",
          dateRange: "2020 – Present",
          bullets: ["Led team of 8", "Reduced latency by 40%"],
        },
      ],
    };
    expect(extractSectionResponseSchema.safeParse(response).success).toBe(true);
  });

  it("validates a text-type section", () => {
    const response = {
      sectionId: "section-1",
      type: "text",
      title: "Summary",
      displayOrder: 1,
      items: [{ description: "Experienced software engineer with 8 years..." }],
    };
    expect(extractSectionResponseSchema.safeParse(response).success).toBe(true);
  });

  it("validates a list-type section", () => {
    const response = {
      sectionId: "section-2",
      type: "list",
      title: "Skills",
      displayOrder: 2,
      items: [
        { heading: "Languages", items: ["Python", "TypeScript", "Go"] },
      ],
    };
    expect(extractSectionResponseSchema.safeParse(response).success).toBe(true);
  });

  it("validates a table-type section", () => {
    const response = {
      sectionId: "section-3",
      type: "table",
      title: "Education",
      displayOrder: 3,
      items: [
        { rows: [{ degree: "B.S. CS", institution: "MIT", year: "2020" }] },
      ],
    };
    expect(extractSectionResponseSchema.safeParse(response).success).toBe(true);
  });

  it("validates a raw-type section", () => {
    const response = {
      sectionId: "section-4",
      type: "raw",
      title: "Other",
      displayOrder: 4,
      items: [{ rawText: "Some unstructured content here" }],
    };
    expect(extractSectionResponseSchema.safeParse(response).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(
      extractSectionResponseSchema.safeParse({ sectionId: "s-0" }).success,
    ).toBe(false);
  });

  it("rejects invalid type", () => {
    const response = {
      sectionId: "section-0",
      type: "invalid",
      title: "Test",
      displayOrder: 0,
      items: [],
    };
    expect(extractSectionResponseSchema.safeParse(response).success).toBe(false);
  });
});
