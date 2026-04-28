export type ValidationOutcome =
  | "VALID"
  | "NOT_A_RESUME"
  | "SCANNED_IMAGE"
  | "TOO_LONG"
  | "INSUFFICIENT_CONTENT"
  | "CORRUPT"
  | "NOT_ENGLISH";

export interface ValidationResult {
  outcome: ValidationOutcome;
  message: string;
}
