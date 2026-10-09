import { describe, it, expect } from "vitest";
import { validateImageMagicBytes } from "./index";

describe("Image Upload Security tests", () => {
  it("recognizes valid PNG magic bytes", () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(validateImageMagicBytes(pngBuffer)).toBe(true);
  });

  it("recognizes valid JPEG magic bytes", () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    expect(validateImageMagicBytes(jpegBuffer)).toBe(true);
  });

  it("rejects malicious executables or scripts pretending to be images", () => {
    // String containing shell script or HTML
    const fakeBuffer = Buffer.from("<?php echo 'malicious'; ?>");
    expect(validateImageMagicBytes(fakeBuffer)).toBe(false);

    const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header
    expect(validateImageMagicBytes(exeBuffer)).toBe(false);
  });

  it("rejects buffers too short", () => {
    expect(validateImageMagicBytes(Buffer.from([0x01, 0x02]))).toBe(false);
  });
});

describe("uploadDocumentFile", () => {
  it("rejects file exceeding size limit", async () => {
    const { uploadDocumentFile } = await import("./index");
    const hugeFile = {
      name: "huge-presentation.pptx",
      size: 60 * 1024 * 1024,
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as File;

    const result = await uploadDocumentFile(hugeFile, "materials");
    expect(result.error).toContain("melebihi batas 50MB");
  });

  it("successfully stores valid document file and returns public url", async () => {
    const { uploadDocumentFile } = await import("./index");
    const fakePdf = new File(["%PDF-1.4 mock content"], "Pertemuan 1 - Pengantar.pdf", {
      type: "application/pdf",
    });

    const result = await uploadDocumentFile(fakePdf, "materials");
    expect(result.error).toBeUndefined();
    expect(result.url).toMatch(/^\/uploads\/materials\/\d+-Pertemuan_1_-_Pengantar-[a-f0-9]+\.pdf$/);
    expect(result.fileName).toBe("Pertemuan 1 - Pengantar.pdf");
  });
});

