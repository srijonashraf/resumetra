import { describe, it, expect } from "vitest";
import {
  templateStyleSchema,
  templateConfigSchema,
} from "@resumetra/shared";

// ── TemplateStyle ────────────────────────────────────────────

describe("templateStyleSchema", () => {
  const validOneColumn = {
    colors: {
      primary: "#1a1a2e",
      secondary: "#16213e",
      accent: "#0f3460",
      text: "#333333",
      textMuted: "#666666",
      background: "#ffffff",
      surface: "#f8f9fa",
    },
    fonts: {
      heading: { family: "Inter", weights: [600, 700] },
      body: { family: "Inter", weights: [400, 500] },
    },
    spacing: {
      sectionGap: 16,
      itemGap: 8,
      bulletGap: 4,
      pageMargin: 40,
    },
    layout: {
      columns: 1,
    },
  };

  const validTwoColumn = {
    ...validOneColumn,
    layout: {
      columns: 2,
      sidebarWidth: 240,
      sidebarPosition: "left" as const,
    },
  };

  it("accepts valid 1-column style", () => {
    expect(templateStyleSchema.parse(validOneColumn)).toEqual(validOneColumn);
  });

  it("accepts valid 2-column style with sidebar options", () => {
    expect(templateStyleSchema.parse(validTwoColumn)).toEqual(validTwoColumn);
  });

  it("accepts 2-column style with sidebarPosition=right", () => {
    const rightSidebar = {
      ...validOneColumn,
      layout: {
        columns: 2,
        sidebarWidth: 200,
        sidebarPosition: "right" as const,
      },
    };
    expect(templateStyleSchema.parse(rightSidebar)).toEqual(rightSidebar);
  });

  it("accepts 2-column style without sidebar options", () => {
    const noSidebar = {
      ...validOneColumn,
      layout: { columns: 2 },
    };
    expect(templateStyleSchema.parse(noSidebar)).toEqual(noSidebar);
  });

  it("rejects columns=3", () => {
    expect(() =>
      templateStyleSchema.parse({
        ...validOneColumn,
        layout: { columns: 3 },
      }),
    ).toThrow();
  });

  it("rejects columns=0", () => {
    expect(() =>
      templateStyleSchema.parse({
        ...validOneColumn,
        layout: { columns: 0 },
      }),
    ).toThrow();
  });

  it("rejects missing colors", () => {
    const { colors: _, ...rest } = validOneColumn;
    expect(() => templateStyleSchema.parse(rest)).toThrow();
  });

  it("rejects missing layout", () => {
    const { layout: _, ...rest } = validOneColumn;
    expect(() => templateStyleSchema.parse(rest)).toThrow();
  });

  it("rejects missing required color fields", () => {
    expect(() =>
      templateStyleSchema.parse({
        ...validOneColumn,
        colors: { primary: "#000" },
      }),
    ).toThrow();
  });

  it("rejects non-string color values", () => {
    expect(() =>
      templateStyleSchema.parse({
        ...validOneColumn,
        colors: { ...validOneColumn.colors, primary: 123 },
      }),
    ).toThrow();
  });

  it("rejects invalid sidebarPosition", () => {
    expect(() =>
      templateStyleSchema.parse({
        ...validOneColumn,
        layout: { columns: 2, sidebarPosition: "top" },
      }),
    ).toThrow();
  });
});

// ── TemplateConfig ───────────────────────────────────────────

describe("templateConfigSchema", () => {
  const validStyle = {
    colors: {
      primary: "#1a1a2e",
      secondary: "#16213e",
      accent: "#0f3460",
      text: "#333333",
      textMuted: "#666666",
      background: "#ffffff",
      surface: "#f8f9fa",
    },
    fonts: {
      heading: { family: "Inter", weights: [600, 700] },
      body: { family: "Inter", weights: [400, 500] },
    },
    spacing: {
      sectionGap: 16,
      itemGap: 8,
      bulletGap: 4,
      pageMargin: 40,
    },
    layout: {
      columns: 1,
    },
  };

  const validConfig = {
    id: "modern",
    name: "Modern",
    description: "A clean modern template",
    style: validStyle,
    sectionRenderers: {
      experience: "ExperienceSection",
      text: "TextSection",
      list: "ListSection",
      table: "TableSection",
      raw: "RawSection",
    },
    sectionOrder: ["experience", "education", "skills"],
  };

  it("accepts valid TemplateConfig with all fields", () => {
    expect(templateConfigSchema.parse(validConfig)).toEqual(validConfig);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validConfig;
    expect(() => templateConfigSchema.parse(rest)).toThrow();
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validConfig;
    expect(() => templateConfigSchema.parse(rest)).toThrow();
  });

  it("rejects empty id", () => {
    expect(() =>
      templateConfigSchema.parse({ ...validConfig, id: "" }),
    ).toThrow();
  });

  it("rejects empty name", () => {
    expect(() =>
      templateConfigSchema.parse({ ...validConfig, name: "" }),
    ).toThrow();
  });

  it("rejects missing sectionRenderers", () => {
    const { sectionRenderers: _, ...rest } = validConfig;
    expect(() => templateConfigSchema.parse(rest)).toThrow();
  });

  it("rejects invalid sectionRenderers key", () => {
    expect(() =>
      templateConfigSchema.parse({
        ...validConfig,
        sectionRenderers: {
          ...validConfig.sectionRenderers,
          invalid_type: "InvalidSection",
        },
      }),
    ).toThrow();
  });

  it("rejects missing style", () => {
    const { style: _, ...rest } = validConfig;
    expect(() => templateConfigSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for sectionOrder", () => {
    expect(() =>
      templateConfigSchema.parse({
        ...validConfig,
        sectionOrder: "experience",
      }),
    ).toThrow();
  });
});
