import { describe, it, expect } from "vitest";
import { formatFileSize, compressImageFile } from "./compress-image";

describe("compress-image utility tests", () => {
  describe("formatFileSize", () => {
    it("formats bytes correctly", () => {
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(0)).toBe("0 B");
    });

    it("formats kilobytes correctly", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1024 * 150)).toBe("150 KB");
    });

    it("formats megabytes correctly", () => {
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe("2.5 MB");
      expect(formatFileSize(1024 * 1024 * 10)).toBe("10.0 MB");
    });
  });

  describe("compressImageFile fallback & non-image behavior", () => {
    it("handles non-image files gracefully without error", async () => {
      const textBlob = new Blob(["Hello world test content"], { type: "text/plain" });
      const file = new File([textBlob], "document.txt", { type: "text/plain" });

      const result = await compressImageFile(file);
      expect(result.isCompressed).toBe(false);
      expect(result.compressionRatio).toBe(0);
      expect(result.sizeBytes).toBe(file.size);
      expect(result.dataUrl).toContain("data:text/plain;base64,");
    });

    it("preserves SVG vector files without rasterizing", async () => {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>`;
      const file = new File([svgContent], "logo.svg", { type: "image/svg+xml" });

      const result = await compressImageFile(file);
      expect(result.isCompressed).toBe(false);
      expect(result.compressionRatio).toBe(0);
      expect(result.dataUrl).toContain("data:image/svg+xml;base64,");
    });
  });
});
