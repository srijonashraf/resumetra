import type { ValidationResult } from "@resumetra/shared";

const SECTION_KEYWORDS = [
  "experience",
  "education",
  "skills",
  "summary",
  "projects",
  "work",
  "objective",
  "profile",
  "certifications",
  "awards",
  "volunteer",
  "publications",
  "interests",
  "languages",
];

const ENGLISH_STOP_WORDS = [
  "the",
  "and",
  "with",
  "experience",
  "education",
  "work",
  "skills",
  "university",
  "email",
  "phone",
  "summary",
  "professional",
  "development",
  "management",
  "project",
  "team",
  "years",
  "months",
  "responsibilities",
  "achieved",
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

export function validateResume(
  text: string,
  pageCount: number,
): ValidationResult {
  if (!text || text.trim().length === 0) {
    return {
      outcome: "NOT_A_RESUME",
      message: "No text could be extracted from the document.",
    };
  }

  if (text.trim().length < 100) {
    return {
      outcome: "INSUFFICIENT_CONTENT",
      message:
        "The document contains too little content to be a valid resume.",
    };
  }

  const lowerText = text.toLowerCase();
  const hasEmail = EMAIL_REGEX.test(text);
  const hasPhone = PHONE_REGEX.test(text);
  const hasContactInfo = hasEmail || hasPhone;

  const hasSectionKeyword = SECTION_KEYWORDS.some((kw) =>
    lowerText.includes(kw),
  );

  if (!hasContactInfo || !hasSectionKeyword) {
    return {
      outcome: "NOT_A_RESUME",
      message: !hasContactInfo
        ? "No contact information (email or phone) found."
        : "No recognizable resume sections found.",
    };
  }

  if (pageCount > 4) {
    return {
      outcome: "TOO_LONG",
      message: `Resume is ${pageCount} pages. Maximum allowed is 4 pages.`,
    };
  }

  const tokens = lowerText.split(/[\s,.;:!?]+/).filter(Boolean);
  const stopWordCount = tokens.filter((token) =>
    ENGLISH_STOP_WORDS.includes(token),
  ).length;
  if (stopWordCount < 3) {
    return {
      outcome: "NOT_ENGLISH",
      message: "The document does not appear to be in English.",
    };
  }

  return { outcome: "VALID", message: "Document is a valid resume." };
}
