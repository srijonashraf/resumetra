import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.fn();
const mockRelease = vi.fn();

vi.mock("../../config/database.js", () => ({
  default: {
    connect: () =>
      Promise.resolve({
        query: mockQuery,
        release: mockRelease,
      }),
  },
}));

import { saveSections } from "../sections.js";
import type { DynamicSection } from "@resumetra/shared";

const MOCK_SECTIONS: DynamicSection[] = [
  {
    id: "section-0",
    type: "experience",
    title: "Experience",
    displayOrder: 0,
    items: [
      {
        id: "item-0-0",
        heading: "Google",
        subheading: "SWE",
        bullets: ["Built stuff"],
      },
    ],
  },
  {
    id: "section-1",
    type: "list",
    title: "Skills",
    displayOrder: 1,
    items: [{ id: "item-1-0", items: ["Python"] }],
  },
];

describe("saveSections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts analysis record and sections in a transaction", async () => {
    const analysisId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

    // Mock sequence: BEGIN → INSERT analysis → DELETE sections → INSERT section 0 → INSERT section 1 → COMMIT
    mockQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN
    mockQuery.mockResolvedValueOnce({ rows: [{ id: analysisId }] }); // INSERT analysis
    mockQuery.mockResolvedValueOnce({ rows: [] }); // DELETE old sections
    mockQuery.mockResolvedValueOnce({ rows: [] }); // INSERT section 0
    mockQuery.mockResolvedValueOnce({ rows: [] }); // INSERT section 1
    mockQuery.mockResolvedValueOnce({ rows: [] }); // COMMIT

    const result = await saveSections({
      userId: "user-123",
      sourceType: "text",
      inputText: "resume text content here",
      sections: MOCK_SECTIONS,
      aiModelVersion: "gemini-3.1-flash",
    });

    expect(result).toBe(analysisId);
    expect(mockQuery).toHaveBeenCalledTimes(6);

    // Check BEGIN was called
    expect(mockQuery.mock.calls[0][0]).toBe("BEGIN");

    // Check COMMIT was called
    expect(mockQuery.mock.calls[5][0]).toBe("COMMIT");

    // Check release was called
    expect(mockRelease).toHaveBeenCalled();
  });

  it("rolls back on error", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN
    mockQuery.mockRejectedValueOnce(new Error("DB error")); // INSERT analysis fails
    mockQuery.mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    await expect(
      saveSections({
        userId: "user-123",
        sourceType: "pdf",
        inputText: "text",
        sections: [],
        aiModelVersion: "test",
      }),
    ).rejects.toThrow("DB error");

    // Check ROLLBACK was called
    const rollbackCall = mockQuery.mock.calls.find(
      (c) => c[0] === "ROLLBACK",
    );
    expect(rollbackCall).toBeTruthy();
    expect(mockRelease).toHaveBeenCalled();
  });

  it("works with null userId", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: "guest-analysis-id" }],
    }); // INSERT
    mockQuery.mockResolvedValueOnce({ rows: [] }); // DELETE
    mockQuery.mockResolvedValueOnce({ rows: [] }); // COMMIT

    const result = await saveSections({
      userId: null,
      sourceType: "text",
      inputText: "guest text",
      sections: [],
      aiModelVersion: "test",
    });

    expect(result).toBe("guest-analysis-id");

    // Check null was passed as user_id
    const insertCall = mockQuery.mock.calls[1];
    expect(insertCall[1][0]).toBeNull();
  });
});
