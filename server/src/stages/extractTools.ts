import { z } from "zod";
import type { ToolDefinition } from "../services/aiService.js";

// --- Tool 1: detect_sections ---

export const detectedSectionSchema = z.object({
  title: z.string().min(1),
  startIndex: z.number().int().min(0),
  endIndex: z.number().int().min(0),
  estimatedType: z.enum(["experience", "text", "list", "table", "raw"]),
});

export const detectSectionsResponseSchema = z.object({
  sections: z.array(detectedSectionSchema),
});

export const detectSectionsTool: ToolDefinition = {
  type: "function",
  function: {
    name: "detect_sections",
    description:
      "Scan resume text and identify all sections with their titles, character boundaries, and estimated types. Returns an array of detected sections.",
    parameters: {
      type: "object",
      properties: {
        sections: {
          type: "array",
          description: "Array of detected sections with their boundaries",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Section title as it appears in the resume",
              },
              startIndex: {
                type: "number",
                description: "Start character index in the original text",
              },
              endIndex: {
                type: "number",
                description: "End character index in the original text",
              },
              estimatedType: {
                type: "string",
                enum: ["experience", "text", "list", "table", "raw"],
                description:
                  "Best guess for section type based on content structure",
              },
            },
            required: ["title", "startIndex", "endIndex", "estimatedType"],
          },
        },
      },
      required: ["sections"],
    },
  },
};

// --- Tool 2: extract_contact ---

export const extractContactResponseSchema = z.object({
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  linkedin: z.string().nullable(),
  github: z.string().nullable(),
  portfolio: z.string().nullable(),
});

export const extractContactTool: ToolDefinition = {
  type: "function",
  function: {
    name: "extract_contact",
    description:
      "Extract contact information from resume text. Returns structured contact data including name, email, phone, location, and social profiles.",
    parameters: {
      type: "object",
      properties: {
        fullName: {
          type: "string",
          description: "Full name of the person",
          nullable: true,
        },
        email: {
          type: "string",
          description: "Email address",
          nullable: true,
        },
        phone: {
          type: "string",
          description: "Phone number",
          nullable: true,
        },
        location: {
          type: "string",
          description: "City, State or full address",
          nullable: true,
        },
        linkedin: {
          type: "string",
          description: "LinkedIn profile URL",
          nullable: true,
        },
        github: {
          type: "string",
          description: "GitHub profile URL",
          nullable: true,
        },
        portfolio: {
          type: "string",
          description: "Portfolio or personal website URL",
          nullable: true,
        },
      },
      required: [
        "fullName",
        "email",
        "phone",
        "location",
        "linkedin",
        "github",
        "portfolio",
      ],
    },
  },
};

// --- Tool 3: extract_section ---

export const extractSectionItemSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  dateRange: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  items: z.array(z.string()).optional(),
  rows: z.array(z.record(z.string(), z.string())).optional(),
  rawText: z.string().optional(),
});

export const extractSectionResponseSchema = z.object({
  sectionId: z.string().min(1),
  type: z.enum(["experience", "text", "list", "table", "raw"]),
  title: z.string().min(1),
  displayOrder: z.number().int().min(0),
  items: z.array(extractSectionItemSchema),
});

export const extractSectionTool: ToolDefinition = {
  type: "function",
  function: {
    name: "extract_section",
    description: `Extract a single resume section into structured data. Choose the type based on content:
- "experience": Job entries with heading (company), subheading (title), dateRange, bullets. Use for work experience, projects with dates.
- "text": Free-form paragraphs. Use for summary, objective, profile sections.
- "list": Named items or skills. Use for skills (categorized lists), certifications, awards, languages, interests.
- "table": Structured rows. Use for education with degree/institution/year columns, or any tabular data.
- "raw": Fallback for unstructured content. Use when the section doesn't fit other types.`,
    parameters: {
      type: "object",
      properties: {
        sectionId: {
          type: "string",
          description:
            "Unique identifier for this section (e.g., 'section-0')",
        },
        type: {
          type: "string",
          enum: ["experience", "text", "list", "table", "raw"],
          description: "The section type determining the data shape",
        },
        title: {
          type: "string",
          description: "Original section title from the resume",
        },
        displayOrder: {
          type: "number",
          description: "0-based display order",
        },
        items: {
          type: "array",
          description: "Section items. Shape varies by type.",
          items: {
            type: "object",
            properties: {
              heading: {
                type: "string",
                description: "For experience: company/project name",
              },
              subheading: {
                type: "string",
                description: "For experience: job title/role",
              },
              dateRange: {
                type: "string",
                description: "Date range like 'Jan 2020 – Present'",
              },
              description: {
                type: "string",
                description: "For text-type: paragraph content",
              },
              bullets: {
                type: "array",
                items: { type: "string" },
                description: "For experience-type: achievement bullets",
              },
              items: {
                type: "array",
                items: { type: "string" },
                description: "For list-type: list entries",
              },
              rows: {
                type: "array",
                items: { type: "object" },
                description: "For table-type: key-value row data",
              },
              rawText: {
                type: "string",
                description: "For raw-type: original unstructured text",
              },
            },
          },
        },
      },
      required: ["sectionId", "type", "title", "displayOrder", "items"],
    },
  },
};

// Export all tools as an array for convenience
export const allExtractionTools: ToolDefinition[] = [
  detectSectionsTool,
  extractContactTool,
  extractSectionTool,
];
