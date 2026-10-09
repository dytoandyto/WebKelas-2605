import { NextRequest, NextResponse } from "next/server";
import { uploadDocumentFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as "materials" | "tasks" | "general") || "materials";

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
