/**
 * Backend response DTOs — typed boundary between API responses and frontend types.
 * SSE extraction events use camelCase.
 */

// ==================== Extraction SSE Payloads ====================

export interface SSEExtractionProgress {
  sectionName: string;
  index: number;
  total: number;
}

export interface SSEExtractionSectionCoverage {
  required: { name: string; present: boolean }[];
  recommended: { name: string; present: boolean }[];
  optional: { name: string; present: boolean }[];
}

export interface SSEExtractionCompletePayload {
  document: {
    contact: {
      fullName: string | null;
      email: string | null;
      phone: string | null;
      location: string | null;
      linkedin: string | null;
      github: string | null;
      portfolio: string | null;
    };
    sections: Array<{
      id: string;
      type: "experience" | "text" | "list" | "table" | "raw";
      title: string;
      displayOrder: number;
      items: Array<{
        id: string;
        heading?: string;
        subheading?: string;
        dateRange?: string;
        description?: string;
        bullets?: string[];
        items?: string[];
        rows?: Record<string, string>[];
        rawText?: string;
      }>;
    }>;
    detectedProfession: string;
    detectedCareerLevel: string;
  };
  profession: { professionId: string; confidence: number };
  careerLevel: { levelId: string; label: string; totalMonths: number };
  sectionCoverage: SSEExtractionSectionCoverage;
  analysisId?: string;
}
