import { NextRequest, NextResponse } from "next/server";
import { assertPermission } from "@/lib/actions/common";
import prisma from "@/lib/db";
import {
  exportStudentsToXlsx,
  exportStudentsToCsv,
  ExportStudentRecord,
} from "@/lib/excel/student-excel";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await assertPermission("STUDENTS_MANAGE");

    const searchParams = req.nextUrl.searchParams;
    const format = (searchParams.get("format") || "xlsx").toLowerCase();
    const scope = (searchParams.get("scope") || "administrative") as "administrative" | "public";
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "ALL"; // ALL | PUBLISHED | DRAFT

    const where: Prisma.StudentWhereInput = {};

    if (scope === "public") {
      where.isPublished = true;
    } else if (statusFilter === "PUBLISHED") {
      where.isPublished = true;
    } else if (statusFilter === "DRAFT") {
      where.isPublished = false;
    }

    if (search.trim()) {
      const q = search.trim();
      const orConditions: Prisma.StudentWhereInput[] = [
        { name: { contains: q, mode: "insensitive" } },
        { nickname: { contains: q, mode: "insensitive" } },
        { major: { contains: q, mode: "insensitive" } },
      ];
      if (scope === "administrative") {
        orConditions.push({ studentNumber: { contains: q, mode: "insensitive" } });
      }
      where.OR = orConditions;
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        achievements: {
          include: {
            achievement: {
              select: { title: true, category: true },
            },
          },
        },
      },
    });

    const exportData: ExportStudentRecord[] = students.map((s) => ({
      id: s.id,
      name: s.name,
      nickname: s.nickname,
      studentNumber: s.studentNumber,
      major: s.major,
      photoUrl: s.photoUrl,
      bio: s.bio,
      dream: s.dream,
      motivation: s.motivation,
      organization: s.organization,
      isPublished: s.isPublished,
      photoApproved: s.photoApproved,
      githubUrl: s.githubUrl,
      linkedinUrl: s.linkedinUrl,
      portfolioUrl: s.portfolioUrl,
      instagramUrl: s.instagramUrl,
      achievements: s.achievements,
    }));

    const dateStr = new Date().toISOString().split("T")[0];
    const scopePrefix = scope === "public" ? "Publik" : "Admin";

    if (format === "csv") {
      const csvContent = exportStudentsToCsv(exportData, { scope, format: "csv" });
      const filename = `ClassHub_Mahasiswa_${scopePrefix}_JS1SI-26-REG-05_${dateStr}.csv`;
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    // Default XLSX
    const xlsxBuffer = await exportStudentsToXlsx(exportData, { scope, format: "xlsx" });
    const filename = `ClassHub_Mahasiswa_${scopePrefix}_JS1SI-26-REG-05_${dateStr}.xlsx`;
    return new NextResponse(new Uint8Array(xlsxBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    const isAuth = err.message?.includes("Unauthorized") || err.message?.includes("Forbidden");
    return NextResponse.json(
      { error: err.message || "Gagal mengekspor data mahasiswa" },
      { status: isAuth ? 403 : 500 }
    );
  }
}
