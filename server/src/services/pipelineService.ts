import type { DynamicSection, ResumeDocument } from "@resumetra/shared";
import { extractPdf } from "./pdfService.js";
import { validateResume } from "../stages/stage0_validate.js";
import { extractResume } from "../stages/stage1_extract.js";
import { detectProfession } from "../stages/detectProfession.js";
import { detectCareerLevel } from "../stages/detectCareerLevel.js";
import { getKnowledgeBase } from "../knowledge/registry.js";
import { saveSections } from "../db/sections.js";

export type PipelineSSESender = (event: string, data: unknown) => void;

export interface ExtractionResult {
  document: ResumeDocument;
  profession: { professionId: string; confidence: number };
  careerLevel: { levelId: string; label: string; totalMonths: number };
  sectionCoverage: {
    required: { name: string; present: boolean }[];
    recommended: { name: string; present: boolean }[];
    optional: { name: string; present: boolean }[];
  };
}

export async function runExtractionPipeline(
  input: {
    pdfBuffer?: Buffer;
    text?: string;
    userId?: string | null;
    originalFileName?: string;
    aiModelVersion?: string;
  },
  sendSSE: PipelineSSESender,
): Promise<ExtractionResult & { analysisId?: string }> {
  // Step 1: Get text and page count
  let text: string;
  let pageCount: number;

  if (input.pdfBuffer) {
    const pdf = await extractPdf(input.pdfBuffer);
    text = pdf.text;
    pageCount = pdf.pageCount;
  } else if (input.text) {
    text = input.text;
    pageCount = Math.max(1, Math.ceil(text.length / 3000));
  } else {
    throw new Error("Either pdfBuffer or text must be provided");
  }

  // Step 2: Validate
  sendSSE("validating", { message: "Validating document..." });
  const validation = validateResume(text, pageCount);
  if (validation.outcome !== "VALID") {
    sendSSE("error", {
      error: validation.message,
      outcome: validation.outcome,
    });
    throw Object.assign(new Error(validation.message), {
      outcome: validation.outcome,
    });
  }

  // Step 3: Extract
  const document = await extractResume(text, sendSSE);

  // Step 4: Detect profession
  const profession = detectProfession(document.sections);

  // Step 5: Detect career level
  const careerLevel = detectCareerLevel(
    document.sections,
    profession.professionId,
  );

  // Step 6: Compute section coverage from KB
  const sectionCoverage = computeSectionCoverage(
    document.sections,
    profession.professionId,
    careerLevel.levelId,
  );

  // Update document with detected profession/level
  document.detectedProfession = profession.professionId;
  document.detectedCareerLevel = careerLevel.levelId;

  // Step 7: Persist sections for authenticated users
  let analysisId: string | undefined;
  if (input.userId) {
    try {
      analysisId = await saveSections({
        userId: input.userId,
        sourceType: input.pdfBuffer ? "pdf" : "text",
        originalFileName: input.originalFileName,
        inputText: text,
        sections: document.sections,
        aiModelVersion: input.aiModelVersion ?? "unknown",
      });
    } catch (dbError) {
      console.error("Failed to persist sections:", dbError);
    }
  }

  return { document, profession, careerLevel, sectionCoverage, analysisId };
}

function computeSectionCoverage(
  sections: DynamicSection[],
  professionId: string,
  levelId: string,
): ExtractionResult["sectionCoverage"] {
  const kb = getKnowledgeBase(professionId);
  const level = kb.careerLevels.find((l) => l.id === levelId);
  if (!level) {
    return { required: [], recommended: [], optional: [] };
  }

  const sectionTitles = sections.map((s) => s.title.toLowerCase());

  const checkPresence = (name: string) =>
    sectionTitles.some((t) => t.includes(name));

  return {
    required: level.requiredSections.map((name) => ({
      name,
      present: checkPresence(name),
    })),
    recommended: level.recommendedSections.map((name) => ({
      name,
      present: checkPresence(name),
    })),
    optional: level.optionalSections.map((name) => ({
      name,
      present: checkPresence(name),
    })),
  };
}
