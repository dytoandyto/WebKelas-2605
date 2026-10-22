import { NextRequest, NextResponse } from "next/server";
import { extractGoogleDriveFileId } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

// Strict Google Drive file ID pattern (alphanumeric, underscores, hyphens, 10-100 chars)
const GOOGLE_DRIVE_ID_REGEX = /^[a-zA-Z0-9_-]{10,100}$/;

/**
 * Bulletproof image proxy for Google Drive photos with defense-in-depth protection.
 * Validates file ID formats, prevents SSRF, and blocks SVG/active content.
 */
export async function GET(request: NextRequest) {
  // Rate limit avatar proxy requests (max 100 requests per minute per IP)
  const clientIp = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`avatar:${clientIp}`, 100, 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan proxy avatar. Silakan coba lagi nanti." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const urlParam = searchParams.get("url");

  const fileId = idParam || extractGoogleDriveFileId(urlParam);

  if (!fileId || !GOOGLE_DRIVE_ID_REGEX.test(fileId)) {
    return NextResponse.json(
      { error: "Format ID atau URL Google Drive tidak valid." },
      { status: 400 }
    );
  }

  // Candidate Google endpoints in order of reliability
  const candidateUrls = [
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=view`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
  ];

  for (const candidate of candidateUrls) {
    try {
      const response = await fetch(candidate, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/jpeg,image/png,image/*;q=0.8",
        },
        redirect: "follow",
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";

      // Ensure response is an image, reject SVG and active scripts to prevent Stored/Reflected XSS
      if (
        response.ok &&
        contentType.startsWith("image/") &&
        !contentType.includes("svg")
      ) {
        const imageBuffer = await response.arrayBuffer();

        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
            "Content-Disposition": "inline",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'",
          },
        });
      }
    } catch {
      // Try next candidate
    }
  }

  return NextResponse.json(
    {
      error:
        "Foto Google Drive tidak dapat dimuat. Pastikan izin akses file di Google Drive disetel ke 'Siapa saja yang memiliki link' (Anyone with the link can view).",
      fileId,
    },
    { status: 404 }
  );
}
