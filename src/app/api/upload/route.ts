import { NextRequest, NextResponse } from "next/server";
import { uploadDocumentFile } from "@/lib/storage";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set(["materials", "tasks", "general"]);

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Silakan login terlebih dahulu untuk mengunggah berkas." },
        { status: 401 }
      );
    }

    // 2. Authorize user permission
    if (!hasPermission(session.role, "VIEW_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Forbidden. Anda tidak memiliki izin untuk mengunggah berkas." },
        { status: 403 }
      );
    }

    // 3. Enforce upload rate limiting (max 30 uploads per 10 minutes)
    const clientIp = getClientIp(req.headers);
    const rateLimit = checkRateLimit(`upload:${session.id}:${clientIp}`, 30, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak permintaan unggah berkas. Silakan coba beberapa saat lagi." },
        { status: 429 }
      );
    }

    // 4. Validate form data
    const formData = await req.formData();
    const file = formData.get("file");
    const rawFolder = (formData.get("folder") as string) || "materials";

    if (!ALLOWED_FOLDERS.has(rawFolder)) {
      return NextResponse.json(
        { success: false, error: "Kategori folder unggahan tidak valid." },
        { status: 400 }
      );
    }
    const folder = rawFolder as "materials" | "tasks" | "general";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Tidak ada berkas yang dipilih untuk diunggah" },
        { status: 400 }
      );
    }

    const result = await uploadDocumentFile(file, folder);

    if (result.error || !result.url) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal mengunggah berkas" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: result.fileName,
      size: result.size,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Terjadi kesalahan saat memproses unggahan",
      },
      { status: 500 }
    );
  }
}
