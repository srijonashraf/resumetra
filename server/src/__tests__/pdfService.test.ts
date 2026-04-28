import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: "" },
}));

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { extractPdf } from "../services/pdfService.js";

const mockGetDocument = vi.mocked(getDocument);

function mockPage(text: string) {
  const items = text.length > 0
    ? text.split(" ").map((word) => ({ str: word }))
    : [];
  return {
    getTextContent: vi.fn().mockResolvedValue({ items }),
  };
}

function mockDoc(pages: string[]) {
  return {
    numPages: pages.length,
    getPage: vi.fn((pageNum: number) => Promise.resolve(mockPage(pages[pageNum - 1]))),
  };
}

// getDocument returns a PDFDocumentLoadingTask with a `promise` property.
// We mock the entire module so we only need the shape our code uses.
function mockLoadingTask(doc: ReturnType<typeof mockDoc>) {
  return { promise: Promise.resolve(doc) } as unknown as ReturnType<typeof getDocument>;
}

function mockLoadingTaskReject(error: Error) {
  return { promise: Promise.reject(error) } as unknown as ReturnType<typeof getDocument>;
}

describe("extractPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts text from a single-page PDF", async () => {
    const doc = mockDoc(["John Doe Software Engineer with extensive experience"]);
    mockGetDocument.mockReturnValue(mockLoadingTask(doc));

    const result = await extractPdf(Buffer.from("fake-pdf"));

    expect(result.pageCount).toBe(1);
    expect(result.text).toContain("John Doe");
    expect(result.pageTexts).toHaveLength(1);
    expect(result.pageTexts[0]).toContain("Software Engineer");
  });

  it("extracts text from a multi-page PDF", async () => {
    const doc = mockDoc([
      "John Doe Software Engineer with extensive professional experience building applications",
      "Education Bachelor of Science Computer Science University of Technology 2020 Graduated",
    ]);
    mockGetDocument.mockReturnValue(mockLoadingTask(doc));

    const result = await extractPdf(Buffer.from("fake-pdf"));

    expect(result.pageCount).toBe(2);
    expect(result.text).toContain("John Doe");
    expect(result.text).toContain("Education");
    expect(result.pageTexts).toHaveLength(2);
    expect(result.pageTexts[0]).toContain("John Doe");
    expect(result.pageTexts[1]).toContain("Education");
  });

  it("separates page texts with double newlines", async () => {
    const doc = mockDoc([
      "First page with enough text content to pass the scanned check threshold",
      "Second page with additional content that meets minimum requirements",
    ]);
    mockGetDocument.mockReturnValue(mockLoadingTask(doc));

    const result = await extractPdf(Buffer.from("fake-pdf"));

    expect(result.text).toBe(
      "First page with enough text content to pass the scanned check threshold\n\nSecond page with additional content that meets minimum requirements"
    );
  });

  it("throws CORRUPT for unparseable PDFs", async () => {
    mockGetDocument.mockReturnValue(mockLoadingTaskReject(new Error("Invalid PDF structure")));

    await expect(extractPdf(Buffer.from("garbage"))).rejects.toThrow("Failed to parse PDF");

    try {
      await extractPdf(Buffer.from("garbage"));
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error & { cause: string }).cause).toBe("CORRUPT");
    }
  });

  it("throws SCANNED_IMAGE for PDFs with less than 50 chars per page average", async () => {
    const doc = mockDoc(["Hi"]);
    mockGetDocument.mockReturnValue(mockLoadingTask(doc));

    await expect(extractPdf(Buffer.from("fake-scanned"))).rejects.toThrow(
      "PDF appears to be a scanned image with no extractable text"
    );

    try {
      await extractPdf(Buffer.from("fake-scanned"));
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error & { cause: string }).cause).toBe("SCANNED_IMAGE");
    }
  });

  it("throws SCANNED_IMAGE for multi-page PDF with very little text", async () => {
    const doc = mockDoc(["Ab", "Cd"]);
    mockGetDocument.mockReturnValue(mockLoadingTask(doc));

    await expect(extractPdf(Buffer.from("fake-scanned"))).rejects.toThrow(
      "PDF appears to be a scanned image with no extractable text"
    );
  });

  it("passes pdfjs-dist a Uint8Array view of the buffer", async () => {
    const doc = mockDoc(["Enough text content here to satisfy the minimum average characters per page requirement"]);
    mockGetDocument.mockReturnValue(mockLoadingTask(doc));

    const buffer = Buffer.from("test-data");
    await extractPdf(buffer);

    const callArgs = mockGetDocument.mock.calls[0][0] as { data: Uint8Array };
    expect(callArgs.data).toBeInstanceOf(Uint8Array);
    expect(callArgs.data.byteLength).toBe(buffer.byteLength);
  });

  it("handles pages with no text items gracefully", async () => {
    const doc = mockDoc([""]);
    mockGetDocument.mockReturnValue(mockLoadingTask(doc));

    await expect(extractPdf(Buffer.from("empty-page"))).rejects.toThrow(
      "PDF appears to be a scanned image with no extractable text"
    );
  });
});
