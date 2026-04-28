import type { SectionType } from "./resumeDocument.js";

export interface TemplateStyle {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    background: string;
    surface: string;
  };
  fonts: {
    heading: { family: string; weights: number[] };
    body: { family: string; weights: number[] };
  };
  spacing: {
    sectionGap: number;
    itemGap: number;
    bulletGap: number;
    pageMargin: number;
  };
  layout: {
    columns: 1 | 2;
    sidebarWidth?: number;
    sidebarPosition?: "left" | "right";
  };
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  style: TemplateStyle;
  sectionRenderers: Record<SectionType, string>;
  sectionOrder: string[];
}
