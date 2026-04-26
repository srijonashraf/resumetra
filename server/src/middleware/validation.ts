import { Request, Response, NextFunction } from "express";

// ==================== VALIDATION HELPERS ====================

/**
 * Pure validation function for resume text
 * Returns validation result with optional error message
 */
const validateResumeInput = (
  resumeText: unknown,
): { valid: boolean; error?: string } => {
  if (!resumeText || typeof resumeText !== "string") {
    return {
      valid: false,
      error: "Resume text is required and must be a string",
    };
  }

  if (resumeText.length > 50000) {
    return {
      valid: false,
      error: "Resume text is too long. Maximum 50,000 characters allowed.",
    };
  }

  return { valid: true };
};

/**
 * Pure validation function for job description
 * Returns validation result with optional error message
 */
const validateJobInput = (
  jobDescription: unknown,
): { valid: boolean; error?: string } => {
  if (!jobDescription || typeof jobDescription !== "string") {
    return {
      valid: false,
      error: "Job description is required and must be a string",
    };
  }

  if (jobDescription.length > 10000) {
    return {
      valid: false,
      error: "Job description is too long. Maximum 10,000 characters allowed.",
    };
  }

  return { valid: true };
};

// ==================== MIDDLEWARE ====================

/**
 * Validates resume text input
 * Checks for presence and type
 */
export const validateResume = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { resumeText } = req.body;
  const result = validateResumeInput(resumeText);

  if (!result.valid) {
    res.status(400).json({ error: result.error });
    return;
  }

  next();
};

/**
 * Validates resume text and job description input together
 * Uses validateResumeInput and validateJobInput helpers
 * Used for job matching, tailoring, and comparison endpoints
 */
export const validateResumeAndJob = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { resumeText, jobDescription } = req.body;

  // Validate resume
  const resumeResult = validateResumeInput(resumeText);
  if (!resumeResult.valid) {
    res.status(400).json({ error: resumeResult.error });
    return;
  }

  // Validate job description
  const jobResult = validateJobInput(jobDescription);
  if (!jobResult.valid) {
    res.status(400).json({ error: jobResult.error });
    return;
  }

  next();
};
