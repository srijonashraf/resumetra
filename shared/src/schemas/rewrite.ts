import { z } from "zod";

export const gapClassificationSchema = z.enum([
  "REWRITTEN",
  "REFRAMED",
  "MISSING",
]);

export const rewriteSchema = z.object({
  id: z.string().min(1),
  sectionId: z.string().min(1),
  itemId: z.string().min(1),
  field: z.string().min(1),
  before: z.string(),
  after: z.string(),
  rationale: z.string(),
  keywordsAdded: z.array(z.string()),
  gapClassification: gapClassificationSchema,
  accepted: z.boolean().nullable(),
});
