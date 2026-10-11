"use server";

import { revalidatePath } from "next/cache";
import { studentSchema, StudentInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";
import {
  StudentExcelRow,
  ImportStrategy,
  ImportExecutionResult,
  parseXlsxBuffer,
  parseCsvText,
  matchHeaderToField,
  ExistingStudentRef,
} from "@/lib/excel/student-excel";

export async function createStudentAction(input: StudentInput): Promise<ActionResult> {
  try {
    await assertPermission("STUDENTS_MANAGE");
    const validation = studentSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    if (data.studentNumber) {
      const existing = await prisma.student.findUnique({
        where: { studentNumber: data.studentNumber },
      });
      if (existing) {
        return { success: false, error: `Student number (NIM) ${data.studentNumber} is already registered.` };
      }
    }

    const student = await prisma.student.create({
      data: {
        name: data.name,
        nickname: data.nickname || null,
        studentNumber: data.studentNumber || null,
        major: data.major || "Sistem Informasi",
        photoUrl: data.photoUrl || null,
        bio: data.bio || null,
        dream: data.dream || null,
        motivation: data.motivation || null,
        organization: data.organization || null,
        isPublished: data.isPublished ?? true,
        photoApproved: data.photoApproved ?? true,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        instagramUrl: data.instagramUrl || null,
      },
    });

    await logActivity("CREATE_STUDENT", "STUDENT", student.id, `Enrolled student: ${student.name}`);
    revalidatePath("/students");
    revalidatePath("/admin/students");
    revalidatePath("/about");
    revalidatePath("/");

    return { success: true, data: student };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create student." };
  }
}

export async function updateStudentAction(id: string, input: StudentInput): Promise<ActionResult> {
  try {
    await assertPermission("STUDENTS_MANAGE");
    const validation = studentSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    if (data.studentNumber) {
      const existing = await prisma.student.findFirst({
        where: {
          studentNumber: data.studentNumber,
          NOT: { id },
        },
      });
      if (existing) {
        return { success: false, error: `Student number (NIM) ${data.studentNumber} is already registered.` };
      }
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        name: data.name,
        nickname: data.nickname || null,
        studentNumber: data.studentNumber || null,
        major: data.major || "Sistem Informasi",
        photoUrl: data.photoUrl || null,
        bio: data.bio || null,
        dream: data.dream || null,
        motivation: data.motivation || null,
        organization: data.organization || null,
        isPublished: data.isPublished ?? true,
        photoApproved: data.photoApproved ?? true,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        instagramUrl: data.instagramUrl || null,
      },
    });

    await logActivity("UPDATE_STUDENT", "STUDENT", student.id, `Updated student profile: ${student.name}`);
    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    revalidatePath("/admin/students");
    revalidatePath("/about");
    revalidatePath("/");

    return { success: true, data: student };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update student." };
  }
}

export async function toggleStudentPublishAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("STUDENTS_MANAGE");
    const existing = await prisma.student.findUnique({
      where: { id },
      select: { id: true, name: true, isPublished: true },
    });
    if (!existing) {
      return { success: false, error: "Mahasiswa tidak ditemukan." };
    }

    const newStatus = !existing.isPublished;
    const student = await prisma.student.update({
      where: { id },
      data: { isPublished: newStatus },
    });

    await logActivity(
      newStatus ? "PUBLISH_STUDENT" : "UNPUBLISH_STUDENT",
      "STUDENT",
      id,
      `${newStatus ? "Dipublikasikan" : "Diubah ke Draft"}: ${student.name}`
    );

    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    revalidatePath("/admin/students");
    revalidatePath("/");

    return { success: true, data: student };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah status publikasi." };
  }
}

export async function toggleStudentPhotoApprovalAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("STUDENTS_MANAGE");
    const existing = await prisma.student.findUnique({
      where: { id },
      select: { id: true, name: true, photoApproved: true },
    });
    if (!existing) {
      return { success: false, error: "Mahasiswa tidak ditemukan." };
    }

    const newApproval = !existing.photoApproved;
    const student = await prisma.student.update({
      where: { id },
      data: { photoApproved: newApproval },
    });

    await logActivity(
      "UPDATE_STUDENT",
      "STUDENT",
      id,
      `Persetujuan foto ${newApproval ? "disetujui" : "dibatalkan"}: ${student.name}`
    );

    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    revalidatePath("/admin/students");
    revalidatePath("/");

    return { success: true, data: student };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah persetujuan foto." };
  }
}

export async function deleteStudentAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("STUDENTS_MANAGE");
    await prisma.student.delete({ where: { id } });

    await logActivity("DELETE_STUDENT", "STUDENT", id, "Removed student from cohort");
    revalidatePath("/students");
    revalidatePath("/admin/students");
    revalidatePath("/about");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete student." };
  }
}

export async function parseStudentFileAction(formData: FormData): Promise<{
  success: boolean;
  data?: {
    fileType: "xlsx" | "csv";
    fileName: string;
    headers: string[];
    rawRows: Record<string, any>[];
    suggestedMapping: Record<string, keyof StudentExcelRow | "IGNORE">;
    existingStudents: ExistingStudentRef[];
  };
  error?: string;
}> {
  try {
    await assertPermission("STUDENTS_MANAGE");
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "File tidak ditemukan dalam request." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Ukuran file melebihi batas maksimal 5 MB." };
    }

    const name = file.name.toLowerCase();
    let fileType: "xlsx" | "csv";
    if (name.endsWith(".xlsx")) {
      fileType = "xlsx";
    } else if (name.endsWith(".csv")) {
      fileType = "csv";
    } else {
      return { success: false, error: "Format file tidak didukung. Harap upload file berekstensi .xlsx atau .csv." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let headers: string[] = [];
    let rawRows: Record<string, any>[] = [];

    if (fileType === "xlsx") {
      const parsed = await parseXlsxBuffer(buffer);
      headers = parsed.headers;
      rawRows = parsed.rawRows;
    } else {
      const text = buffer.toString("utf-8");
      const parsed = parseCsvText(text);
      headers = parsed.headers;
      rawRows = parsed.rawRows;
    }

    if (rawRows.length === 0) {
      return { success: false, error: "File tidak memiliki baris data atau kosong." };
    }

    // Generate suggested mapping
    const suggestedMapping: Record<string, keyof StudentExcelRow | "IGNORE"> = {};
    headers.forEach((h) => {
      const matched = matchHeaderToField(h);
      suggestedMapping[h] = matched || "IGNORE";
    });

    const existingStudents = await prisma.student.findMany({
      select: { id: true, name: true, studentNumber: true },
    });

    return {
      success: true,
      data: {
        fileType,
        fileName: file.name,
        headers,
        rawRows,
        suggestedMapping,
        existingStudents,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memproses file mahasiswa." };
  }
}

export async function importStudentsBatchAction(
  rows: StudentExcelRow[],
  strategy: ImportStrategy
): Promise<{ success: boolean; data?: ImportExecutionResult; error?: string }> {
  try {
    await assertPermission("STUDENTS_MANAGE");

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, error: "Tidak ada data mahasiswa yang dikirim untuk diimpor." };
    }

    // Limit batch to 100 rows per run for serverless safety
    if (rows.length > 150) {
      return { success: false, error: "Maksimal 150 baris per sekali impor demi stabilitas server." };
    }

    // Fetch existing students to match securely
    const existingStudents = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        studentNumber: true,
      },
    });

    const existingByNim = new Map<string, typeof existingStudents[0]>();
    const existingByName = new Map<string, typeof existingStudents[0]>();

    existingStudents.forEach((s) => {
      if (s.studentNumber) {
        existingByNim.set(s.studentNumber.trim().toLowerCase(), s);
      }
      existingByName.set(s.name.trim().toLowerCase(), s);
    });

    const rowReports: ImportExecutionResult["rowReports"] = [];
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;
      const rawName = (row.nama_lengkap || "").trim();
      const rawNim = row.nim ? String(row.nim).trim() : null;

      // Skip dummy template rows
      if (rawName.toUpperCase().includes("(HAPUS BARIS INI)")) {
        rowReports.push({
          rowNumber,
          name: rawName,
          nim: rawNim,
          status: "SKIPPED",
          message: "Baris contoh template diabaikan secara otomatis.",
        });
        skippedCount++;
        continue;
      }

      if (rawName.length < 2) {
        rowReports.push({
          rowNumber,
          name: rawName || "(Nama kosong)",
          nim: rawNim,
          status: "FAILED",
          message: "Nama lengkap tidak valid (kurang dari 2 karakter).",
        });
        failedCount++;
        continue;
      }

      // Check matching in DB
      let matchedStudent: typeof existingStudents[0] | undefined;
      if (rawNim && existingByNim.has(rawNim.toLowerCase())) {
        matchedStudent = existingByNim.get(rawNim.toLowerCase());
      } else if (existingByName.has(rawName.toLowerCase())) {
        matchedStudent = existingByName.get(rawName.toLowerCase());
      }

      const isDuplicate = !!matchedStudent;

      try {
        if (isDuplicate) {
          if (strategy === "CREATE_ONLY") {
            rowReports.push({
              rowNumber,
              name: rawName,
              nim: rawNim,
              status: "SKIPPED",
              message: `Dilewati (mode Tambah Baru): Mahasiswa sudah terdaftar (${matchedStudent?.name}).`,
            });
            skippedCount++;
            continue;
          }

          if (strategy === "SKIP_DUPLICATES") {
            rowReports.push({
              rowNumber,
              name: rawName,
              nim: rawNim,
              status: "SKIPPED",
              message: `Dilewati (mode Lewati Duplikat): Cocok dengan data '${matchedStudent?.name}'.`,
            });
            skippedCount++;
            continue;
          }

          if (strategy === "UPDATE_MATCHED") {
            // Update matched student
            const updatePayload: Record<string, any> = {
              name: rawName,
              nickname: row.nama_panggilan || null,
              major: row.program_studi || "Sistem Informasi",
              isPublished: row.profil_publik,
              photoApproved: row.foto_disetujui,
            };

            if (row.foto_url) updatePayload.photoUrl = row.foto_url;
            if (row.cita_cita) updatePayload.dream = row.cita_cita;
            if (row.motivasi) updatePayload.motivation = row.motivasi;
            if (row.organisasi) updatePayload.organization = row.organisasi;
            if (row.biodata) updatePayload.bio = row.biodata;
            if (row.instagram) updatePayload.instagramUrl = row.instagram;
            if (row.linkedin) updatePayload.linkedinUrl = row.linkedin;
            if (row.github) updatePayload.githubUrl = row.github;
            if (row.portfolio) updatePayload.portfolioUrl = row.portfolio;
            if (rawNim) updatePayload.studentNumber = rawNim;

            await prisma.student.update({
              where: { id: matchedStudent!.id },
              data: updatePayload,
            });

            rowReports.push({
              rowNumber,
              name: rawName,
              nim: rawNim,
              status: "UPDATED",
              message: `Berhasil diperbarui (ID: ${matchedStudent!.id}). Status: ${row.profil_publik ? "Published" : "Draft"}.`,
            });
            updatedCount++;
            continue;
          }
        }

        // New student insert
        const newStudent = await prisma.student.create({
          data: {
            name: rawName,
            nickname: row.nama_panggilan || null,
            studentNumber: rawNim,
            major: row.program_studi || "Sistem Informasi",
            photoUrl: row.foto_url || null,
            dream: row.cita_cita || null,
            motivation: row.motivasi || null,
            organization: row.organisasi || null,
            bio: row.biodata || null,
            isPublished: row.profil_publik,
            photoApproved: row.foto_disetujui,
            instagramUrl: row.instagram || null,
            linkedinUrl: row.linkedin || null,
            githubUrl: row.github || null,
            portfolioUrl: row.portfolio || null,
          },
        });

        // Track in local map to prevent file internal duplicate clashes
        if (rawNim) existingByNim.set(rawNim.toLowerCase(), newStudent);
        existingByName.set(rawName.toLowerCase(), newStudent);

        rowReports.push({
          rowNumber,
          name: rawName,
          nim: rawNim,
          status: "CREATED",
          message: `Berhasil ditambahkan. Status: ${row.profil_publik ? "Published" : "Draft"}.`,
        });
        createdCount++;
      } catch (err: any) {
        rowReports.push({
          rowNumber,
          name: rawName,
          nim: rawNim,
          status: "FAILED",
          message: err.message || "Gagal menyimpan ke database.",
        });
        failedCount++;
      }
    }

    await logActivity(
      "IMPORT_STUDENTS",
      "STUDENT",
      undefined,
      `Impor massal selesai: ${createdCount} baru, ${updatedCount} diperbarui, ${skippedCount} dilewati, ${failedCount} gagal.`
    );

    revalidatePath("/students");
    revalidatePath("/admin/students");
    revalidatePath("/about");
    revalidatePath("/");

    return {
      success: true,
      data: {
        strategy,
        totalProcessed: rows.length,
        createdCount,
        updatedCount,
        skippedCount,
        failedCount,
        rowReports,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menjalankan proses impor mahasiswa." };
  }
}
