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
