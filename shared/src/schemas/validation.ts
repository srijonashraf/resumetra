import { z } from "zod";

export const validationOutcomeSchema = z.enum([
  "VALID",
  "NOT_A_RESUME",
  "SCANNED_IMAGE",
  "TOO_LONG",
  "INSUFFICIENT_CONTENT",
  "CORRUPT",
  "NOT_ENGLISH",
]);

export const validationResultSchema = z.object({
  outcome: validationOutcomeSchema,
  message: z.string(),
});
