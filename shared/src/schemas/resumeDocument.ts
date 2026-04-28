import { z } from "zod";

export const sectionTypeSchema = z.enum([
  "experience",
  "text",
  "list",
  "table",
  "raw",
]);

export const sectionItemSchema = z.object({
  id: z.string().min(1),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  dateRange: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  items: z.array(z.string()).optional(),
  rows: z.array(z.record(z.string(), z.string())).optional(),
  rawText: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const dynamicSectionSchema = z.object({
  id: z.string().min(1),
  type: sectionTypeSchema,
  title: z.string().min(1),
  displayOrder: z.number().int().min(0),
  items: z.array(sectionItemSchema),
});

export const resumeDocumentSchema = z.object({
  contact: z.object({
    fullName: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    linkedin: z.string().nullable(),
    github: z.string().nullable(),
    portfolio: z.string().nullable(),
  }),
  sections: z.array(dynamicSectionSchema),
  detectedProfession: z.string().min(1),
  detectedCareerLevel: z.string().min(1),
});
