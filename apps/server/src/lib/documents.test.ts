import { describe, it, expect } from "vitest";
import {
  sniffDocumentKind,
  sanitizeFileName,
  normalizeTitle,
  normalizeDescription,
  normalizeCategory,
  normalizeCategoryName,
  formatBytes,
} from "./documents";

const enc = (s: string) => new TextEncoder().encode(s);

function zipWithEntry(entryName: string): Uint8Array {
  // Minimal stand-in for a ZIP local file header: signature + filler +
  // the (uncompressed) entry name, which is how the sniffer finds
  // "word/document.xml".
  const header = [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00];
  return new Uint8Array([...header, ...enc(entryName), ...enc("payload")]);
}

describe("sniffDocumentKind", () => {
  it("detects a real PDF by its magic bytes", () => {
    const pdf = enc("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF");
    expect(sniffDocumentKind(pdf)).toBe("pdf");
  });

  it("accepts a PDF with leading junk inside the first 1024 bytes", () => {
    const combined = new Uint8Array(200 + 40);
    combined.fill(0x41, 0, 200); // junk prefix
    combined.set(enc("%PDF-1.7\n1 0 obj\nendobj\n%%EOF"), 200);
    expect(sniffDocumentKind(combined)).toBe("pdf");
  });

  it("rejects %PDF that only appears beyond the first 1024 bytes", () => {
    const bytes = new Uint8Array(1200);
    bytes.set(enc("%PDF-1.7"), 1100);
    expect(sniffDocumentKind(bytes)).toBeNull();
  });

  it("detects a real docx (zip containing word/document.xml)", () => {
    expect(sniffDocumentKind(zipWithEntry("word/document.xml"))).toBe("docx");
    expect(sniffDocumentKind(zipWithEntry("[Content_Types].xmlword/document.xml"))).toBe("docx");
  });

  it("rejects an executable renamed to .pdf", () => {
    const exe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    expect(sniffDocumentKind(exe)).toBeNull();
  });

  it("rejects plain text pretending to be a pdf", () => {
    expect(sniffDocumentKind(enc("just some text\n"))).toBeNull();
  });

  it("rejects a zip that is not a Word document", () => {
    expect(sniffDocumentKind(zipWithEntry("media/image.png"))).toBeNull();
    // A word/ folder without the required main document part is not a docx.
    expect(sniffDocumentKind(zipWithEntry("word/styles.xml"))).toBeNull();
  });

  it("finds the entry name in head or tail windows of large archives", () => {
    const needle = enc("word/document.xml");
    const head = new Uint8Array(4 * 1024 * 1024);
    head.set([0x50, 0x4b, 0x03, 0x04], 0);
    head.set(needle, 100);
    expect(sniffDocumentKind(head)).toBe("docx");

    const tail = new Uint8Array(4 * 1024 * 1024);
    tail.set([0x50, 0x4b, 0x03, 0x04], 0);
    tail.set(needle, tail.length - 100);
    expect(sniffDocumentKind(tail)).toBe("docx");
  });

  it("rejects empty and truncated input", () => {
    expect(sniffDocumentKind(new Uint8Array(0))).toBeNull();
    expect(sniffDocumentKind(new Uint8Array([0x25, 0x50]))).toBeNull();
  });
});

describe("sanitizeFileName", () => {
  it("strips control characters and path separators", () => {
    expect(sanitizeFileName("a\u0000b/../c\\d.pdf")).toBe("ab_.._c_d.pdf");
  });

  it("caps length at 200 chars", () => {
    expect(sanitizeFileName("x".repeat(500))).toHaveLength(200);
  });

  it("falls back to 'file' when empty", () => {
    expect(sanitizeFileName("")).toBe("file");
    expect(sanitizeFileName("\u0001\u0002")).toBe("file");
  });
});

describe("normalizeTitle", () => {
  it("trims a valid title", () => {
    expect(normalizeTitle("  My Report  ", "a.pdf")).toBe("My Report");
  });

  it("falls back to the filename stem when blank", () => {
    expect(normalizeTitle("", "annual report.pdf")).toBe("annual report");
    expect(normalizeTitle(undefined, "notes.docx")).toBe("notes");
  });

  it("rejects titles over 120 chars", () => {
    expect(normalizeTitle("x".repeat(121), "a.pdf")).toBeNull();
  });

  it("rejects when both title and filename stem are empty", () => {
    expect(normalizeTitle("   ", ".pdf")).toBeNull();
  });
});

describe("normalizeDescription", () => {
  it("treats empty as null", () => {
    expect(normalizeDescription("")).toEqual({ ok: true, value: null });
    expect(normalizeDescription(undefined)).toEqual({ ok: true, value: null });
    expect(normalizeDescription("   ")).toEqual({ ok: true, value: null });
  });

  it("accepts and trims normal text", () => {
    expect(normalizeDescription(" Q4 numbers ")).toEqual({ ok: true, value: "Q4 numbers" });
  });

  it("rejects non-strings and text over 1000 chars", () => {
    expect(normalizeDescription(42)).toEqual({ ok: false });
    expect(normalizeDescription("x".repeat(1001))).toEqual({ ok: false });
  });
});

describe("normalizeCategory", () => {
  it("defaults to 'other' when missing", () => {
    expect(normalizeCategory(undefined)).toBe("other");
    expect(normalizeCategory("")).toBe("other");
  });

  it("accepts known categories case-insensitively", () => {
    expect(normalizeCategory("Invoice")).toBe("invoice");
    expect(normalizeCategory(" contract ")).toBe("contract");
  });

  it("rejects unknown categories", () => {
    expect(normalizeCategory("malware")).toBeNull();
    expect(normalizeCategory(7)).toBeNull();
  });

  it("accepts the user's custom categories, preserving stored spelling", () => {
    expect(normalizeCategory("taxes 2025", ["Taxes 2025"])).toBe("Taxes 2025");
    expect(normalizeCategory(" TAXES 2025 ", ["Taxes 2025"])).toBe("Taxes 2025");
    expect(normalizeCategory("Receipts", ["Receipts"])).toBe("Receipts");
  });

  it("does not accept another list's categories by mistake", () => {
    expect(normalizeCategory("taxes", ["Receipts"])).toBeNull();
    // Custom names never override builtins.
    expect(normalizeCategory("report", ["report-notes"])).toBe("report");
  });

  it("rejects non-strings even when customs exist", () => {
    expect(normalizeCategory(7, ["Taxes"])).toBeNull();
  });
});

describe("normalizeCategoryName", () => {
  it("trims and accepts a normal name", () => {
    expect(normalizeCategoryName("  Taxes  ")).toEqual({ ok: true, value: "Taxes" });
    expect(normalizeCategoryName("Q3 Reports")).toEqual({ ok: true, value: "Q3 Reports" });
  });

  it("rejects builtin names case-insensitively", () => {
    expect(normalizeCategoryName("Invoice")).toEqual({ ok: false, reason: "builtin" });
    expect(normalizeCategoryName(" other ")).toEqual({ ok: false, reason: "builtin" });
  });

  it("rejects empty, non-string, and overlong names", () => {
    expect(normalizeCategoryName("")).toEqual({ ok: false, reason: "invalid_name" });
    expect(normalizeCategoryName("   ")).toEqual({ ok: false, reason: "invalid_name" });
    expect(normalizeCategoryName(42)).toEqual({ ok: false, reason: "invalid_name" });
    expect(normalizeCategoryName(null)).toEqual({ ok: false, reason: "invalid_name" });
    expect(normalizeCategoryName("x".repeat(41))).toEqual({
      ok: false,
      reason: "invalid_name",
    });
  });

  it("strips control characters", () => {
    expect(normalizeCategoryName("Taxes\x00\x1f!")).toEqual({ ok: true, value: "Taxes!" });
  });
});

describe("formatBytes", () => {
  it("formats bytes, KB, MB, GB", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(10 * 1024 * 1024)).toBe("10 MB");
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
});
