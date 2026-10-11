import { NextRequest, NextResponse } from "next/server";
import { assertPermission } from "@/lib/actions/common";
import {
  generateStudentTemplateXlsx,
  generateStudentTemplateCsv,
} from "@/lib/excel/student-excel";

export async function GET(req: NextRequest) {
  try {
    await assertPermission("STUDENTS_MANAGE");

    const format = req.nextUrl.searchParams.get("format") || "xlsx";

    if (format === "csv") {
      const csvContent = generateStudentTemplateCsv();
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="ClassHub_Template_Mahasiswa_JS1SI-26-REG-05.csv"',
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    // Default XLSX
    const xlsxBuffer = await generateStudentTemplateXlsx();
    return new NextResponse(new Uint8Array(xlsxBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="ClassHub_Template_Mahasiswa_JS1SI-26-REG-05.xlsx"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    const isAuth = err.message?.includes("Unauthorized") || err.message?.includes("Forbidden");
    return NextResponse.json(
      { error: err.message || "Failed to generate template" },
      { status: isAuth ? 403 : 500 }
    );
  }
}
