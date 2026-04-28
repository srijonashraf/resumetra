import { create } from "zustand";
import type { TailorResult, AnalysisResult } from "./useStore";
import { parsedDataToSectionHtml, tailorToEditorContent } from "../utils/editorTransforms";

interface EditorSection {
  id: string;
  name: string;
  priority: "High" | "Medium" | "Low";
  htmlContent: string;
  isDirty: boolean;
  originalAfter: string;
  isAiModified: boolean;
}

interface ResumeEditorState {
  sections: EditorSection[];
  activeSectionId: string | null;
  editorMode: "edit" | "template";
  selectedTemplate: "professional" | "modern";
  isExporting: boolean;

  initializeFromTailorResult: (
    result: TailorResult,
    parsedData: AnalysisResult["parsedData"],
  ) => void;
  updateSectionContent: (id: string, html: string) => void;
  setActiveSection: (id: string) => void;
  revertSection: (id: string) => void;
  setEditorMode: (mode: "edit" | "template") => void;
  setSelectedTemplate: (template: "professional" | "modern") => void;
  setIsExporting: (exporting: boolean) => void;
  resetEditor: () => void;
}

const initialState = {
  sections: [],
  activeSectionId: null as string | null,
  editorMode: "edit" as const,
  selectedTemplate: "professional" as const,
  isExporting: false,
};

// ── Keyword-set matching (mirrors editorTransforms) ──

const SECTION_KEYWORD_MAP: Record<string, string[]> = {
  summary: ["summary", "objective", "profile", "about"],
  workExperiences: [
    "experience",
    "employment",
    "work",
    "professional background",
    "career history",
  ],
  education: ["education", "academic", "qualification"],
  projects: ["project", "portfolio"],
  certifications: ["certification", "certificate", "credential", "license"],
  skills: ["skill", "competenc", "technical", "technologies"],
};

function matchSectionKey(sectionName: string): string | null {
  const lower = sectionName.toLowerCase();
  for (const [key, keywords] of Object.entries(SECTION_KEYWORD_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return key;
    }
  }
  return null;
}

const useResumeEditorStore = create<ResumeEditorState>()((set) => ({
  ...initialState,

  initializeFromTailorResult: (
    result: TailorResult,
    parsedData: AnalysisResult["parsedData"],
  ) => {
    const sections: EditorSection[] = [];

    // 1. Map tailored sections
    const matchedKeys = new Set<string>();

    for (let i = 0; i < result.sections.length; i++) {
      const section = result.sections[i];
      const html = tailorToEditorContent(section.after);
      sections.push({
        id: `tailored-${i}`,
        name: section.name,
        priority: section.priority,
        htmlContent: html,
        isDirty: false,
        originalAfter: html,
        isAiModified: true,
      });

      const key = matchSectionKey(section.name);
      if (key) matchedKeys.add(key);
    }

    // 2. Map untailored parsedData sections
    const untailoredSections: Array<{
      key: string;
      data: NonNullable<unknown>;
    }> = [];

    if (!matchedKeys.has("education") && parsedData.education.length > 0) {
      untailoredSections.push({ key: "education", data: parsedData.education });
    }
    if (
      !matchedKeys.has("workExperiences") &&
      parsedData.workExperiences.length > 0
    ) {
      untailoredSections.push({
        key: "workExperiences",
        data: parsedData.workExperiences,
      });
    }
    if (!matchedKeys.has("projects") && parsedData.projects.length > 0) {
      untailoredSections.push({ key: "projects", data: parsedData.projects });
    }
    if (
      !matchedKeys.has("certifications") &&
      parsedData.certifications.length > 0
    ) {
      untailoredSections.push({
        key: "certifications",
        data: parsedData.certifications,
      });
    }

    for (const { key, data } of untailoredSections) {
      const html = parsedDataToSectionHtml(key, data);
      if (html) {
        sections.push({
          id: `parsed-${key}`,
          name: formatSectionName(key),
          priority: "Low",
          htmlContent: html,
          isDirty: false,
          originalAfter: html,
          isAiModified: false,
        });
      }
    }

    set({
      sections,
      activeSectionId: sections.length > 0 ? sections[0].id : null,
    });
  },

  updateSectionContent: (id: string, html: string) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, htmlContent: html, isDirty: true } : s,
      ),
    })),

  setActiveSection: (id: string) => set({ activeSectionId: id }),

  revertSection: (id: string) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id
          ? { ...s, htmlContent: s.originalAfter, isDirty: false }
          : s,
      ),
    })),

  setEditorMode: (mode) => set({ editorMode: mode }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setIsExporting: (exporting) => set({ isExporting: exporting }),

  resetEditor: () => set(initialState),
}));

function formatSectionName(key: string): string {
  const names: Record<string, string> = {
    workExperiences: "Work Experience",
    education: "Education",
    projects: "Projects",
    certifications: "Certifications",
  };
  return names[key] ?? key;
}

export { useResumeEditorStore };
export type { EditorSection, ResumeEditorState };
