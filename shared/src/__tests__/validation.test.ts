import { describe, it, expect } from "vitest";
import {
  validationOutcomeSchema,
  validationResultSchema,
} from "../schemas/validation.js";

describe("validationOutcomeSchema", () => {
  it("accepts all 7 valid outcomes", () => {
    const outcomes = [
      "VALID",
      "NOT_A_RESUME",
      "SCANNED_IMAGE",
      "TOO_LONG",
      "INSUFFICIENT_CONTENT",
      "CORRUPT",
      "NOT_ENGLISH",
    ];
    for (const outcome of outcomes) {
      expect(validationOutcomeSchema.safeParse(outcome).success).toBe(true);
    }
  });

  it("rejects invalid strings", () => {
    expect(validationOutcomeSchema.safeParse("INVALID").success).toBe(false);
    expect(validationOutcomeSchema.safeParse("").success).toBe(false);
    expect(validationOutcomeSchema.safeParse(123).success).toBe(false);
  });
});

describe("validationResultSchema", () => {
  it("accepts valid result objects", () => {
    const result = validationResultSchema.safeParse({
      outcome: "VALID",
      message: "Document is valid",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(
      validationResultSchema.safeParse({ outcome: "VALID" }).success,
    ).toBe(false);
    expect(
      validationResultSchema.safeParse({ message: "test" }).success,
    ).toBe(false);
  });

  it("rejects invalid outcome", () => {
    expect(
      validationResultSchema.safeParse({
        outcome: "UNKNOWN",
        message: "test",
      }).success,
    ).toBe(false);
  });
});
