import { ContactInfo } from "./contact";

export type SectionType = "experience" | "text" | "list" | "table" | "raw";

export interface SectionItem {
  id: string;
  heading?: string;
  subheading?: string;
  dateRange?: string;
  description?: string;
  bullets?: string[];
  items?: string[];
  rows?: Record<string, string>[];
  rawText?: string;
  metadata?: Record<string, string>;
}

export interface DynamicSection {
  id: string;
  type: SectionType;
  title: string;
  displayOrder: number;
  items: SectionItem[];
}

export interface ResumeDocument {
  contact: ContactInfo;
  sections: DynamicSection[];
  detectedProfession: string;
  detectedCareerLevel: string;
}
