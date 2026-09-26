import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Verify file buffer magic numbers to prevent malicious file extension spoofing
export function validateImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // GIF: 47 49 46 38 (GIF8)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }

  // WebP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
}

export interface UploadResult {
  url: string;
  error?: string;
}

export async function uploadImageFile(
  file: File,
  folder: "students" | "gallery" | "achievements" | "announcements"
): Promise<UploadResult> {
  if (!file) {
    return { url: "", error: "No file provided" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { url: "", error: "File size exceeds 5MB limit" };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { url: "", error: "Invalid image type. Allowed types: JPEG, PNG, WebP, GIF" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate magic bytes
  if (!validateImageMagicBytes(buffer)) {
    return { url: "", error: "File content does not match a valid image format" };
  }

  // Sanitize filename and generate unique name
  const ext = file.type.split("/")[1] || "jpg";
  const uniqueId = crypto.randomBytes(12).toString("hex");
  const fileName = `${Date.now()}-${uniqueId}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  // Try Supabase Storage if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("mock-storage") &&
    !supabaseUrl.includes("your-project")
  ) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.storage
        .from("classhub")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("classhub")
          .getPublicUrl(filePath);

        return { url: publicUrlData.publicUrl };
      }
    } catch {
      // Fallback to local storage
    }
  }

  // Local fallback storage for development
  try {
    const localDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(localDir, { recursive: true });
    const localFilePath = path.join(localDir, fileName);
    await fs.writeFile(localFilePath, buffer);
    return { url: `/uploads/${folder}/${fileName}` };
  } catch (err) {
    return { url: "", error: "Failed to store image" };
  }
}
