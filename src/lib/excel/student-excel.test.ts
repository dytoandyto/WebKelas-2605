import { describe, it, expect } from "vitest";
import {
  generateStudentTemplateXlsx,
  generateStudentTemplateCsv,
  exportStudentsToXlsx,
  exportStudentsToCsv,
  sanitizeCsvFormula,
  parseCsvText,
  parseXlsxBuffer,
  matchHeaderToField,
  processAndValidateStudentRows,
  ExistingStudentRef,
} from "./student-excel";
import ExcelJS from "exceljs";

describe("Student Excel & CSV Manager Test Suite", () => {
  describe("1. Template Generation Tests", () => {
    it("generates an XLSX template with Petunjuk, Mahasiswa, and Referensi sheets", async () => {
      const buffer = await generateStudentTemplateXlsx();
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      const sheetNames = workbook.worksheets.map((ws) => ws.name);
      expect(sheetNames).toContain("Petunjuk");
      expect(sheetNames).toContain("Mahasiswa");
      expect(sheetNames).toContain("Referensi");

      const studentSheet = workbook.getWorksheet("Mahasiswa");
      expect(studentSheet).toBeDefined();

      const headerRow = studentSheet?.getRow(1);
      const headers: string[] = [];
      headerRow?.eachCell((cell) => {
        headers.push(cell.value?.toString() || "");
      });

      expect(headers).toContain("nama_lengkap");
      expect(headers).toContain("nama_panggilan");
      expect(headers).toContain("nim");
      expect(headers).toContain("profil_publik");
      expect(headers).toContain("foto_disetujui");
    });

    it("generates a CSV template containing UTF-8 BOM and correct headers", () => {
      const csv = generateStudentTemplateCsv();
      expect(csv.charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM
      expect(csv).toContain("nama_lengkap");
      expect(csv).toContain("nama_panggilan");
      expect(csv).toContain("profil_publik");
      expect(csv).toContain("foto_disetujui");
    });
  });

  describe("2. CSV Formula Injection Sanitization", () => {
    it("prepends an apostrophe to values starting with unsafe formula characters (=, +, -, @)", () => {
      expect(sanitizeCsvFormula("=cmd|'/C calc'!A0")).toBe("'=cmd|'/C calc'!A0");
      expect(sanitizeCsvFormula("+123456")).toBe("'+123456");
      expect(sanitizeCsvFormula("-SUM(1,2)")).toBe("'-SUM(1,2)");
      expect(sanitizeCsvFormula("@SUM(1,2)")).toBe("'@SUM(1,2)");
    });

    it("leaves safe text unchanged", () => {
      expect(sanitizeCsvFormula("Farhan Maulana")).toBe("Farhan Maulana");
      expect(sanitizeCsvFormula("1202223001")).toBe("1202223001");
      expect(sanitizeCsvFormula("Sistem Informasi")).toBe("Sistem Informasi");
      expect(sanitizeCsvFormula("")).toBe("");
    });
  });

  describe("3. Data Export Tests (Admin vs Public)", () => {
    const mockStudents = [
      {
        id: "stu-1",
        name: "Muhammad Rizki",
        nickname: "Rizki",
        studentNumber: "1204210001",
        major: "Sistem Informasi",
        photoUrl: "https://example.com/rizki.jpg",
        bio: "Suka software engineering",
        dream: "Tech Lead",
        motivation: "Terus berkembang",
        organization: "Himpunan SI",
        isPublished: true,
        photoApproved: true,
        instagramUrl: "https://instagram.com/rizki",
        linkedinUrl: null,
        githubUrl: null,
        portfolioUrl: null,
      },
      {
        id: "stu-2",
        name: "Aisyah Putri",
        nickname: "Aisyah",
        studentNumber: "1204210002",
        major: "Sistem Informasi",
        photoUrl: "https://example.com/aisyah.jpg",
        bio: "Minat UI/UX design",
        dream: "Product Designer",
        motivation: "Desain untuk manusia",
        organization: "BEM",
        isPublished: false, // DRAFT
        photoApproved: false, // FOTO BELUM DISETUJUI
        instagramUrl: null,
        linkedinUrl: null,
        githubUrl: null,
        portfolioUrl: null,
      },
    ];

    it("exports administrative CSV including NIM and publication status", () => {
      const csvAdmin = exportStudentsToCsv(mockStudents, { scope: "administrative", format: "csv" });
      expect(csvAdmin).toContain("1204210001");
      expect(csvAdmin).toContain("1204210002");
      expect(csvAdmin).toContain('"Ya"');
      expect(csvAdmin).toContain('"Tidak"');
      expect(csvAdmin).toContain("https://example.com/aisyah.jpg");
    });

    it("exports public CSV filtering sensitive NIM and masking unapproved photos", () => {
      const csvPublic = exportStudentsToCsv(mockStudents, { scope: "public", format: "csv" });
      expect(csvPublic).not.toContain("1204210001");
      expect(csvPublic).not.toContain("1204210002");
      // Aisyah photo is not approved, so photo URL should be masked/empty
      expect(csvPublic).not.toContain("https://example.com/aisyah.jpg");
      // Rizki photo is approved, so it appears
      expect(csvPublic).toContain("https://example.com/rizki.jpg");
    });

    it("exports administrative XLSX with complete workbook structure", async () => {
      const buffer = await exportStudentsToXlsx(mockStudents, { scope: "administrative", format: "xlsx" });
      expect(buffer).toBeInstanceOf(Buffer);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const sheet = workbook.getWorksheet("Mahasiswa");
      expect(sheet).toBeDefined();
      expect(sheet?.rowCount).toBeGreaterThanOrEqual(3); // Header + 2 rows
    });
  });

  describe("4. Header Dictionary Auto-Matching", () => {
    it("accurately matches common variations of Indonesian and English headers", () => {
      expect(matchHeaderToField("Nama Lengkap")).toBe("nama_lengkap");
      expect(matchHeaderToField("Full Name")).toBe("nama_lengkap");
      expect(matchHeaderToField("Nama Panggilan")).toBe("nama_panggilan");
      expect(matchHeaderToField("Nickname")).toBe("nama_panggilan");
      expect(matchHeaderToField("NIM")).toBe("nim");
      expect(matchHeaderToField("Nomor Induk Mahasiswa")).toBe("nim");
      expect(matchHeaderToField("Student ID")).toBe("nim");
      expect(matchHeaderToField("Cita-cita")).toBe("cita_cita");
      expect(matchHeaderToField("Career Goal")).toBe("cita_cita");
      expect(matchHeaderToField("Impian")).toBe("cita_cita");
      expect(matchHeaderToField("Cita-cita / Impian")).toBe("cita_cita");
      expect(matchHeaderToField("Motto")).toBe("motivasi");
      expect(matchHeaderToField("Motivasi")).toBe("motivasi");
      expect(matchHeaderToField("Motto / Motivasi")).toBe("motivasi");
      expect(matchHeaderToField("Motto Motivasi")).toBe("motivasi");
      expect(matchHeaderToField("Latar Belakang")).toBe("biodata");
      expect(matchHeaderToField("Bio & Background")).toBe("biodata");
      expect(matchHeaderToField("Biodata Diri")).toBe("biodata");
      expect(matchHeaderToField("Organisasi")).toBe("organisasi");
      expect(matchHeaderToField("Status Publikasi")).toBe("profil_publik");
      expect(matchHeaderToField("Persetujuan Foto")).toBe("foto_disetujui");
    });

    it("returns null for unrecognized headers", () => {
      expect(matchHeaderToField("Kolom Random 123")).toBeNull();
      expect(matchHeaderToField("Catatan Internal")).toBeNull();
    });
  });

  describe("5. CSV Parsing Robustness (RFC 4180 & Indonesian Characters)", () => {
    it("handles commas, semicolons, quotes, newlines, and Indonesian characters correctly", () => {
      const sampleCsv = `nama_lengkap;nama_panggilan;bio;profil_publik\r\n"Muhammad Julfi, S.Kom";"Julfi";"Suka pempek & rendang\r\nBerminat di AI";"Ya"\r\n"Dewi Sartika";"Dewi";"Aktif di organisasi";"Tidak"`;
      const parsed = parseCsvText(sampleCsv);

      expect(parsed.headers).toEqual(["nama_lengkap", "nama_panggilan", "bio", "profil_publik"]);
      expect(parsed.rawRows.length).toBe(2);
      expect(parsed.rawRows[0]["nama_lengkap"]).toBe("Muhammad Julfi, S.Kom");
      expect(parsed.rawRows[0]["nama_panggilan"]).toBe("Julfi");
      expect(parsed.rawRows[0]["bio"]).toContain("Berminat di AI");
      expect(parsed.rawRows[0]["profil_publik"]).toBe("Ya");
      expect(parsed.rawRows[1]["nama_lengkap"]).toBe("Dewi Sartika");
    });
  });

  describe("6. Validation & Duplicate Checking", () => {
    const existingDbStudents: ExistingStudentRef[] = [
      { id: "stu-existing-1", name: "Budi Santoso", studentNumber: "1204210099" },
    ];

    it("detects valid rows, missing required fields, and duplicate records", () => {
      const headers = ["nama_lengkap", "nim", "profil_publik"];
      const rawRows = [
        // Row 1: Valid new student
        { nama_lengkap: "Dimas Anggara", nim: "1204210050", profil_publik: "Ya" },
        // Row 2: Invalid (missing name)
        { nama_lengkap: "", nim: "1204210051", profil_publik: "Ya" },
        // Row 3: Matches existing student in DB by NIM
        { nama_lengkap: "Budi Santoso Update", nim: "1204210099", profil_publik: "Published" },
        // Row 4: Duplicate in same file (same NIM as Row 1)
        { nama_lengkap: "Dimas Anggara Duplikat", nim: "1204210050", profil_publik: "Ya" },
      ];

      const mapping = {
        nama_lengkap: "nama_lengkap" as const,
        nim: "nim" as const,
        profil_publik: "profil_publik" as const,
      };

      const result = processAndValidateStudentRows(headers, rawRows, mapping, existingDbStudents);

      expect(result.summary.totalRows).toBe(4);
      expect(result.summary.invalidRows).toBe(2); // Row 2 has missing name, Row 4 has duplicate NIM
      expect(result.summary.validRows).toBe(2);

      // Check Row 1: New
      expect(result.rows[0].errors).toHaveLength(0);
      expect(result.rows[0].matchedExistingStudentId).toBeNull();
      expect(result.rows[0].isDuplicateInFile).toBe(false);

      // Check Row 2: Error
      expect(result.rows[1].errors[0]).toContain("Nama lengkap wajib diisi");

      // Check Row 3: Matched DB
      expect(result.rows[2].matchedExistingStudentId).toBe("stu-existing-1");
      expect(result.rows[2].data.profil_publik).toBe(true);

      // Check Row 4: Duplicate in file
      expect(result.rows[3].isDuplicateInFile).toBe(true);
      expect(result.rows[3].errors.some((e) => e.includes("Duplikasi NIM"))).toBe(true);
    });
  });
});
