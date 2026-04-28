import { z } from "zod";
import { sectionTypeSchema } from "./resumeDocument.js";

export const templateStyleSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    text: z.string(),
    textMuted: z.string(),
    background: z.string(),
    surface: z.string(),
  }),
  fonts: z.object({
    heading: z.object({
      family: z.string(),
      weights: z.array(z.number()),
    }),
    body: z.object({
      family: z.string(),
      weights: z.array(z.number()),
    }),
  }),
  spacing: z.object({
    sectionGap: z.number(),
    itemGap: z.number(),
    bulletGap: z.number(),
    pageMargin: z.number(),
  }),
  layout: z.object({
    columns: z.union([z.literal(1), z.literal(2)]),
    sidebarWidth: z.number().optional(),
    sidebarPosition: z.enum(["left", "right"]).optional(),
  }),
});

export const templateConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  style: templateStyleSchema,
  sectionRenderers: z.record(sectionTypeSchema, z.string()),
  sectionOrder: z.array(z.string()),
});
