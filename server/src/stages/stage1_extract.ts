import type { ContactInfo, DynamicSection, ResumeDocument } from "@resumetra/shared";
import { callTool } from "../services/aiService.js";
import {
  detectSectionsTool,
  extractContactTool,
  extractSectionTool,
  allExtractionTools,
  detectSectionsResponseSchema,
  extractContactResponseSchema,
  extractSectionResponseSchema,
} from "./extractTools.js";
import { EXTRACTION_SYSTEM_PROMPT } from "./extractPrompts.js";

export type SSESender = (event: string, data: unknown) => void;

export async function extractResume(
  rawText: string,
  sendSSE: SSESender,
): Promise<ResumeDocument> {
  const messages: Parameters<typeof callTool>[0] = [
    { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
    { role: "user", content: rawText },
  ];

  // Step 1: Detect sections
  sendSSE("extracting", { sectionName: "sections", index: 0, total: 0 });
  const sectionsResult = await callTool(
    messages,
    [detectSectionsTool],
    "detect_sections",
    detectSectionsResponseSchema,
  );
  const detectedSections = sectionsResult.data.sections;

  // Step 2: Extract contact info
  sendSSE("extracting", { sectionName: "contact", index: 0, total: detectedSections.length });
  const contactResult = await callTool(
    messages,
    [extractContactTool],
    "extract_contact",
    extractContactResponseSchema,
  );
  const contact: ContactInfo = contactResult.data;

  // Step 3: Extract each section
  const sections: DynamicSection[] = [];
  const totalSections = detectedSections.length;

  for (let i = 0; i < totalSections; i++) {
    const detected = detectedSections[i];
    const sectionId = `section-${i}`;
    const sectionText = rawText.slice(detected.startIndex, detected.endIndex);

    sendSSE("extracting", {
      sectionName: detected.title,
      index: i + 1,
      total: totalSections,
    });

    try {
      const sectionResult = await callTool(
        [
          ...messages,
          {
            role: "user",
            content: `Extract this section:\n\n${sectionText}`,
          },
        ],
        [extractSectionTool],
        "extract_section",
        extractSectionResponseSchema,
      );

      const extracted = sectionResult.data;
      sections.push({
        id: sectionId,
        type: extracted.type,
        title: extracted.title,
        displayOrder: i,
        items: extracted.items.map((item, j) => ({
          id: `item-${i}-${j}`,
          ...item,
        })),
      });
    } catch {
      // Raw fallback on failure
      sections.push({
        id: sectionId,
        type: "raw",
        title: detected.title,
        displayOrder: i,
        items: [
          {
            id: `item-${i}-0`,
            rawText: sectionText,
          },
        ],
      });
    }
  }

  return {
    contact,
    sections,
    detectedProfession: "generic",
    detectedCareerLevel: "all_levels",
  };
}
