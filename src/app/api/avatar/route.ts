import { NextRequest, NextResponse } from "next/server";
import { extractGoogleDriveFileId } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Bulletproof image proxy for Google Drive photos.
 * Ensures images display seamlessly even if the client browser or network
 * encounters CORS, third-party cookie, or referrer restrictions.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const urlParam = searchParams.get("url");

  const fileId = idParam || extractGoogleDriveFileId(urlParam);

  if (!fileId) {
    return NextResponse.json(
      { error: "Parameter id atau url Google Drive tidak valid." },
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
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
        redirect: "follow",
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";

      // Ensure response is an image, not an HTML error or virus-scan page
      if (response.ok && contentType.startsWith("image/")) {
        const imageBuffer = await response.arrayBuffer();

        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
            "Content-Disposition": "inline",
            "Access-Control-Allow-Origin": "*",
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
