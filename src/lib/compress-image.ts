/**
 * Client-Side Image Compression Utility
 * 
 * Compresses images (JPEG, PNG, WebP) directly in the user's browser using HTML5 Canvas.
 * Reduces file sizes by 80-95% while maintaining sharp visual fidelity, without external dependencies.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1, recommended: 0.80 - 0.85
  mimeType?: string; // default: 'image/webp'
}

export interface CompressionResult {
  dataUrl: string;
  sizeBytes: number;
  formattedSize: string;
  originalSizeBytes: number;
  originalFormattedSize: string;
  compressionRatio: number; // percentage saved, e.g. 85 for 85% reduction
  isCompressed: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

async function readFileAsDataUrl(file: File): Promise<string> {
  if (typeof FileReader !== "undefined") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Node.js / test environment fallback
  if (typeof Buffer !== "undefined" && typeof file.arrayBuffer === "function") {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mime = file.type || "application/octet-stream";
    return `data:${mime};base64,${base64}`;
  }

  return "";
}

/**
 * Compresses an image file in the browser using HTML5 canvas with smooth downsampling.
 * Automatically preserves SVG vectors and GIF animations without raster loss.
 */
export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    mimeType = "image/webp",
  } = options;

  const originalSize = file.size;
  const originalFormatted = formatFileSize(originalSize);

  // If running in SSR or not an image, return raw file as Data URL
  if (typeof window === "undefined" || !file.type.startsWith("image/")) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      dataUrl,
      sizeBytes: originalSize,
      formattedSize: originalFormatted,
      originalSizeBytes: originalSize,
      originalFormattedSize: originalFormatted,
      compressionRatio: 0,
      isCompressed: false,
    };
  }

  // Preserve vector graphics (SVG) and animations (GIF)
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      dataUrl,
      sizeBytes: originalSize,
      formattedSize: originalFormatted,
      originalSizeBytes: originalSize,
      originalFormattedSize: originalFormatted,
      compressionRatio: 0,
      isCompressed: false,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Calculate proportional dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) {
        // Fallback to raw file if canvas context unavailable
        readFileAsDataUrl(file).then((rawUrl) => {
          resolve({
            dataUrl: rawUrl,
            sizeBytes: originalSize,
            formattedSize: originalFormatted,
            originalSizeBytes: originalSize,
            originalFormattedSize: originalFormatted,
            compressionRatio: 0,
            isCompressed: false,
          });
        });
        return;
      }

      // High-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Export to WebP (or fallback to JPEG if format unsupported)
      let compressedDataUrl = canvas.toDataURL(mimeType, quality);
      if (!compressedDataUrl.startsWith(`data:${mimeType}`)) {
        compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      // Approximate byte size from base64 string length
      const approxBytes = Math.round((compressedDataUrl.length * 3) / 4);

      // If compressed size is not smaller than original, keep original
      if (approxBytes >= originalSize) {
        readFileAsDataUrl(file).then((rawUrl) => {
          resolve({
            dataUrl: rawUrl,
            sizeBytes: originalSize,
            formattedSize: originalFormatted,
            originalSizeBytes: originalSize,
            originalFormattedSize: originalFormatted,
            compressionRatio: 0,
            isCompressed: false,
          });
        });
        return;
      }

      const ratio = Math.round(((originalSize - approxBytes) / originalSize) * 100);

      resolve({
        dataUrl: compressedDataUrl,
        sizeBytes: approxBytes,
        formattedSize: formatFileSize(approxBytes),
        originalSizeBytes: originalSize,
        originalFormattedSize: originalFormatted,
        compressionRatio: Math.max(0, ratio),
        isCompressed: true,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback on load error
      readFileAsDataUrl(file).then((rawUrl) => {
        resolve({
          dataUrl: rawUrl,
          sizeBytes: originalSize,
          formattedSize: originalFormatted,
          originalSizeBytes: originalSize,
          originalFormattedSize: originalFormatted,
          compressionRatio: 0,
          isCompressed: false,
        });
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Converts a base64 Data URL to a native File object for multipart form upload.
 */
export function dataUrlToFile(dataUrl: string, fileName: string): File {
  const parts = dataUrl.split(",");
  const mime = parts[0]?.match(/:(.*?);/)?.[1] || "application/octet-stream";
  const binary = atob(parts[1] || "");
  const length = binary.length;
  const buffer = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return new File([buffer], fileName, { type: mime });
}

