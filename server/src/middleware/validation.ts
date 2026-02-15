import { Request, Response, NextFunction } from "express";

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

  if (!resumeText || typeof resumeText !== "string") {
    res.status(400).json({
      error: "Resume text is required and must be a string",
    });
    return;
  }

  if (resumeText.length > 50000) {
    res.status(400).json({
      error: "Resume text is too long. Maximum 50,000 characters allowed.",
    });
    return;
  }

  next();
};

/**
 * Validates resume text and job description input
 * Used for job matching, tailoring, and comparison endpoints
 */
export const validateResumeAndJob = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { resumeText, jobDescription } = req.body;

  // Check presence
  if (!resumeText || !jobDescription) {
    res.status(400).json({
      error: "Resume text and job description are required",
    });
    return;
  }

  // Check types
  if (typeof resumeText !== "string" || typeof jobDescription !== "string") {
    res.status(400).json({
      error: "Resume text and job description must be strings",
    });
    return;
  }

  // Validate resume length
  if (resumeText.length > 50000) {
    res.status(400).json({
      error: "Resume text is too long. Maximum 50,000 characters allowed.",
    });
    return;
  }

  // Validate job description length
  if (jobDescription.length > 10000) {
    res.status(400).json({
      error: "Job description is too long. Maximum 10,000 characters allowed.",
    });
    return;
  }

  next();
};

/**
 * Validates original text and job description for rewriting
 * Used for smart rewrite endpoint
 */
export const validateRewriteInput = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { originalText, jobDescription } = req.body;

  // Check presence
  if (!originalText || !jobDescription) {
    res.status(400).json({
      error: "Original text and job description are required",
    });
    return;
  }

  // Check types
  if (typeof originalText !== "string" || typeof jobDescription !== "string") {
    res.status(400).json({
      error: "Original text and job description must be strings",
    });
    return;
  }

  // Validate text length
  if (originalText.length > 5000) {
    res.status(400).json({
      error: "Original text is too long. Maximum 5,000 characters allowed.",
    });
    return;
  }

  // Validate job description length
  if (jobDescription.length > 10000) {
    res.status(400).json({
      error: "Job description is too long. Maximum 10,000 characters allowed.",
    });
    return;
  }

  next();
};
