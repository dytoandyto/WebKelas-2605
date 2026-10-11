import ExcelJS from "exceljs";
import { parseBooleanFlex } from "@/lib/validations";
import {
  formatExternalUrl,
  formatGithubUrl,
  formatInstagramUrl,
  formatLinkedinUrl,
} from "@/lib/utils";

export interface StudentExcelRow {
  nama_lengkap: string;
  nama_panggilan?: string | null;
  nim?: string | null;
  program_studi?: string | null;
  foto_url?: string | null;
  cita_cita?: string | null;
  motivasi?: string | null;
  organisasi?: string | null;
  biodata?: string | null;
  profil_publik: boolean;
  foto_disetujui: boolean;
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  [key: string]: unknown;
}

export interface ParsedRowResult {
  rowNumber: number;
  data: StudentExcelRow;
  rawData: Record<string, any>;
  errors: string[];
  warnings: string[];
  isDuplicateInFile: boolean;
  matchedExistingStudentId?: string | null;
  matchedBy?: "NIM" | "NAME" | null;
}

export interface FileParseResult {
  headers: string[];
  recognizedHeaders: string[];
  unrecognizedHeaders: string[];
  rows: ParsedRowResult[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
  };
}

export type ImportStrategy = "CREATE_ONLY" | "UPDATE_MATCHED" | "SKIP_DUPLICATES";

export interface ImportExecutionResult {
  strategy: ImportStrategy;
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  rowReports: Array<{
    rowNumber: number;
    name: string;
    nim?: string | null;
    status: "CREATED" | "UPDATED" | "SKIPPED" | "FAILED";
    message: string;
  }>;
}

// -------------------------------------------------------------
// 1. SANITIZATION (CSV FORMULA INJECTION MITIGATION)
// -------------------------------------------------------------
const DANGEROUS_FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

export function sanitizeCsvFormula(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = String(value).trim();
  if (str.length === 0) return "";
  const firstChar = str.charAt(0);
  if (DANGEROUS_FORMULA_PREFIXES.includes(firstChar)) {
    // Prefix single quote so Excel/Google Sheets treats it as string literal
    str = `'${str}`;
  }
  return str;
}

// -------------------------------------------------------------
// 2. TEMPLATE GENERATION (XLSX & CSV)
// -------------------------------------------------------------
const TEMPLATE_HEADERS = [
  { key: "nama_lengkap", label: "nama_lengkap", width: 28 },
  { key: "nama_panggilan", label: "nama_panggilan", width: 18 },
  { key: "nim", label: "nim", width: 16 },
  { key: "program_studi", label: "program_studi", width: 22 },
  { key: "foto_url", label: "foto_url", width: 32 },
  { key: "cita_cita", label: "cita_cita", width: 25 },
  { key: "motivasi", label: "motivasi", width: 30 },
  { key: "organisasi", label: "organisasi", width: 28 },
  { key: "biodata", label: "biodata", width: 35 },
  { key: "profil_publik", label: "profil_publik", width: 16 },
  { key: "foto_disetujui", label: "foto_disetujui", width: 16 },
  { key: "instagram", label: "instagram", width: 22 },
  { key: "linkedin", label: "linkedin", width: 25 },
  { key: "github", label: "github", width: 25 },
  { key: "portfolio", label: "portfolio", width: 25 },
];

export async function generateStudentTemplateXlsx(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ClassHub JS1SI-26-REG-05";
  workbook.created = new Date();

  // ---------------- SHEET 1: PETUNJUK ----------------
  const guideSheet = workbook.addWorksheet("Petunjuk", {
    views: [{ showGridLines: true }],
  });

  guideSheet.columns = [
    { width: 24 },
    { width: 12 },
    { width: 65 },
    { width: 35 },
  ];

  guideSheet.addRow(["PETUNJUK PENGISIAN TEMPLATE MAHASISWA CLASSHUB"]);
  guideSheet.addRow(["Kelas: JS1SI-26-REG-05 • S1 Sistem Informasi Telkom University Jakarta"]);
  guideSheet.addRow([]);

  guideSheet.getCell("A1").font = { name: "Arial", size: 14, bold: true, color: { argb: "FF0284C7" } };
  guideSheet.getCell("A2").font = { name: "Arial", size: 10, italic: true, color: { argb: "FF475569" } };

  guideSheet.addRow(["ATURAN UTAMA:"]);
  guideSheet.addRow(["1. Kolom 'nama_lengkap' adalah satu-satunya kolom WAJIB diisi (minimal 2 karakter)."]);
  guideSheet.addRow(["2. Kolom 'nim' bersifat OPSIONAL untuk arsip internal. Sistem tidak pernah mengekspos NIM ke publik."]);
  guideSheet.addRow(["3. Kolom 'profil_publik' & 'foto_disetujui': isi dengan 'Ya' atau 'Tidak'. Default jika kosong adalah 'Tidak' (disimpan sebagai Draft agar aman)."]);
  guideSheet.addRow(["4. Jangan mengubah baris header pada sheet 'Mahasiswa' agar sistem dapat mengenali kolom secara otomatis."]);
  guideSheet.addRow(["5. File ini dapat langsung dibuka dan diisi di Microsoft Excel, Google Sheets, maupun LibreOffice."]);
  guideSheet.addRow([]);

  guideSheet.addRow(["TABEL SPESIFIKASI KOLOM"]);
  const guideHeaderRow = guideSheet.addRow(["Nama Kolom", "Wajib?", "Keterangan", "Contoh Format"]);
  guideHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  guideHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0369A1" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const columnSpecs = [
    ["nama_lengkap", "YA", "Nama lengkap mahasiswa sesuai identitas resmi", "Andyto Murti Pangudi"],
    ["nama_panggilan", "Tidak", "Nama panggilan akrab di kelas", "Dyto"],
    ["nim", "Tidak", "Nomor Induk Mahasiswa (Internal, tidak dipublikasikan)", "110012630033"],
    ["program_studi", "Tidak", "Program studi (default: Sistem Informasi)", "Sistem Informasi"],
    ["foto_url", "Tidak", "URL foto profil yang valid (JPG/PNG/WebP)", "https://example.com/foto.jpg"],
    ["cita_cita", "Tidak", "Tujuan karir atau cita-cita", "Data Engineer / Cloud Architect"],
    ["motivasi", "Tidak", "Motto hidup atau motivasi singkat", "Learn, Build, and Grow Together."],
    ["organisasi", "Tidak", "Pengalaman organisasi atau kepanitiaan", "Himpunan Mahasiswa SI (HMSI)"],
    ["biodata", "Tidak", "Deskripsi singkat tentang minat dan latar belakang", "Tertarik pada rekayasa data dan backend."],
    ["profil_publik", "Tidak", "Persetujuan publikasi di portal (Ya / Tidak). Default: Tidak", "Ya"],
    ["foto_disetujui", "Tidak", "Persetujuan foto profil tampil publik (Ya / Tidak). Default: Tidak", "Ya"],
    ["instagram", "Tidak", "Akun Instagram (username atau link https://...)", "dytoandyto"],
    ["linkedin", "Tidak", "URL profil LinkedIn", "https://linkedin.com/in/username"],
    ["github", "Tidak", "URL profil GitHub", "https://github.com/username"],
    ["portfolio", "Tidak", "URL website pribadi atau portofolio", "https://dyto.dev"],
  ];

  columnSpecs.forEach((spec) => {
    const row = guideSheet.addRow(spec);
    row.getCell(2).alignment = { horizontal: "center" };
    if (spec[1] === "YA") {
      row.getCell(2).font = { bold: true, color: { argb: "FFDC2626" } };
    }
  });

  // ---------------- SHEET 2: MAHASISWA ----------------
  const studentSheet = workbook.addWorksheet("Mahasiswa", {
    views: [{ showGridLines: true }],
  });

  studentSheet.columns = TEMPLATE_HEADERS.map((h) => ({
    header: h.label,
    key: h.key,
    width: h.width,
  }));

  const studentHeaderRow = studentSheet.getRow(1);
  studentHeaderRow.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  studentHeaderRow.alignment = { vertical: "middle", horizontal: "center" };
  studentHeaderRow.height = 28;
  studentHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" }, // Slate 900
    };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF0284C7" } },
    };
  });

  // Add sample placeholder rows (Clearly marked CONTOH)
  studentSheet.addRow({
    nama_lengkap: "Contoh Mahasiswa Pertama (HAPUS BARIS INI)",
    nama_panggilan: "Contoh 1",
    nim: "110012600001",
    program_studi: "Sistem Informasi",
    foto_url: "",
    cita_cita: "Full Stack Engineer",
    motivasi: "Pantang menyerah sebelum mencoba.",
    organisasi: "BEM Telkom University Jakarta",
    biodata: "Suka programming dan teknologi cloud.",
    profil_publik: "Tidak",
    foto_disetujui: "Tidak",
    instagram: "contoh_akun1",
    linkedin: "https://linkedin.com/in/contoh1",
    github: "https://github.com/contoh1",
    portfolio: "https://contoh1.dev",
  });

  studentSheet.addRow({
    nama_lengkap: "Contoh Mahasiswa Kedua (HAPUS BARIS INI)",
    nama_panggilan: "Contoh 2",
    nim: "110012600002",
    program_studi: "Sistem Informasi",
    foto_url: "",
    cita_cita: "Product Manager",
    motivasi: "Keep learning and sharing.",
    organisasi: "Google Developer Student Club",
    biodata: "Fokus pada manajemen proyek teknologi.",
    profil_publik: "Ya",
    foto_disetujui: "Tidak",
    instagram: "contoh_akun2",
    linkedin: "https://linkedin.com/in/contoh2",
    github: "",
    portfolio: "",
  });

  // ---------------- SHEET 3: REFERENSI ----------------
  const refSheet = workbook.addWorksheet("Referensi", {
    views: [{ showGridLines: true }],
  });

  refSheet.columns = [{ width: 25 }, { width: 30 }];
  refSheet.addRow(["DAFTAR NILAI REFERENSI"]);
  refSheet.addRow([]);
  refSheet.getCell("A1").font = { bold: true, size: 12, color: { argb: "FF0284C7" } };

  refSheet.addRow(["Nilai Program Studi", "Keterangan"]);
  refSheet.addRow(["Sistem Informasi", "Program Studi Utama Kelas JS1SI-26-REG-05"]);
  refSheet.addRow([]);

  refSheet.addRow(["Nilai Status Publikasi", "Keterangan"]);
  refSheet.addRow(["Ya", "Profil disetujui untuk tampil di website publik"]);
  refSheet.addRow(["Tidak", "Profil disimpan sebagai Draft (hanya admin yang dapat melihat)"]);
  refSheet.addRow([]);

  refSheet.addRow(["Nilai Persetujuan Foto", "Keterangan"]);
  refSheet.addRow(["Ya", "Foto disetujui untuk ditampilkan ke publik"]);
  refSheet.addRow(["Tidak", "Foto tidak ditampilkan ke publik (diganti inisial nama)"]);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function generateStudentTemplateCsv(): string {
  const headers = TEMPLATE_HEADERS.map((h) => h.label).join(",");
  const sample1 = [
    `"Contoh Mahasiswa Pertama (HAPUS BARIS INI)"`,
    `"Contoh 1"`,
    `"110012600001"`,
    `"Sistem Informasi"`,
    `""`,
    `"Full Stack Engineer"`,
    `"Pantang menyerah sebelum mencoba."`,
    `"BEM Telkom University Jakarta"`,
    `"Suka programming dan teknologi cloud."`,
    `"Tidak"`,
    `"Tidak"`,
    `"contoh_akun1"`,
    `"https://linkedin.com/in/contoh1"`,
    `"https://github.com/contoh1"`,
    `"https://contoh1.dev"`,
  ].join(",");

  const sample2 = [
    `"Contoh Mahasiswa Kedua (HAPUS BARIS INI)"`,
    `"Contoh 2"`,
    `"110012600002"`,
    `"Sistem Informasi"`,
    `""`,
    `"Product Manager"`,
    `"Keep learning and sharing."`,
    `"Google Developer Student Club"`,
    `"Fokus pada manajemen proyek teknologi."`,
    `"Ya"`,
    `"Tidak"`,
    `"contoh_akun2"`,
    `"https://linkedin.com/in/contoh2"`,
    `""`,
    `""`,
  ].join(",");

  // Include UTF-8 BOM so Excel on Windows opens CSV with proper encoding
  return `\uFEFF${headers}\r\n${sample1}\r\n${sample2}\r\n`;
}

// -------------------------------------------------------------
// 3. EXPORT STUDENTS (XLSX & CSV)
// -------------------------------------------------------------
export interface ExportStudentRecord {
  id: string;
  name: string;
  nickname?: string | null;
  studentNumber?: string | null;
  major: string;
  photoUrl?: string | null;
  bio?: string | null;
  dream?: string | null;
  motivation?: string | null;
  organization?: string | null;
  isPublished: boolean;
  photoApproved: boolean;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  instagramUrl?: string | null;
  achievements?: any[];
}

export interface ExportOptions {
  scope: "administrative" | "public";
  format: "xlsx" | "csv";
}

export async function exportStudentsToXlsx(
  students: ExportStudentRecord[],
  options: ExportOptions
): Promise<Buffer> {
  const isPublic = options.scope === "public";
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ClassHub Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Mahasiswa", {
    views: [{ showGridLines: true }],
  });

  const columns = [
    { header: "Nama Lengkap", key: "name", width: 28 },
    { header: "Nama Panggilan", key: "nickname", width: 18 },
  ];

  if (!isPublic) {
    columns.push({ header: "NIM", key: "studentNumber", width: 16 });
  }

  columns.push(
    { header: "Program Studi", key: "major", width: 22 },
    { header: "Foto Profil", key: "photoUrl", width: 30 },
    { header: "Cita-Cita", key: "dream", width: 25 },
    { header: "Motivasi", key: "motivation", width: 30 },
    { header: "Organisasi", key: "organization", width: 25 },
    { header: "Biodata", key: "bio", width: 35 }
  );

  if (!isPublic) {
    columns.push(
      { header: "Status Publikasi", key: "isPublished", width: 18 },
      { header: "Foto Disetujui", key: "photoApproved", width: 18 }
    );
  }

  columns.push(
    { header: "Instagram", key: "instagramUrl", width: 22 },
    { header: "LinkedIn", key: "linkedinUrl", width: 25 },
    { header: "GitHub", key: "githubUrl", width: 25 },
    { header: "Portfolio", key: "portfolioUrl", width: 25 }
  );

  sheet.columns = columns;

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.height = 26;
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF0284C7" } },
    };
  });

  // Populate data
  students.forEach((s) => {
    // If public and photo not approved, omit photo
    const photo = isPublic && !s.photoApproved ? "" : s.photoUrl || "";

    const rowData: Record<string, any> = {
      name: sanitizeCsvFormula(s.name),
      nickname: sanitizeCsvFormula(s.nickname || ""),
      major: sanitizeCsvFormula(s.major || "Sistem Informasi"),
      photoUrl: sanitizeCsvFormula(photo),
      dream: sanitizeCsvFormula(s.dream || ""),
      motivation: sanitizeCsvFormula(s.motivation || ""),
      organization: sanitizeCsvFormula(s.organization || ""),
      bio: sanitizeCsvFormula(s.bio || ""),
      instagramUrl: sanitizeCsvFormula(s.instagramUrl || ""),
      linkedinUrl: sanitizeCsvFormula(s.linkedinUrl || ""),
      githubUrl: sanitizeCsvFormula(s.githubUrl || ""),
      portfolioUrl: sanitizeCsvFormula(s.portfolioUrl || ""),
    };

    if (!isPublic) {
      rowData.studentNumber = sanitizeCsvFormula(s.studentNumber || "");
      rowData.isPublished = s.isPublished ? "Published" : "Draft";
      rowData.photoApproved = s.photoApproved ? "Disetujui" : "Belum";
    }

    const row = sheet.addRow(rowData);
    row.alignment = { vertical: "middle" };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function exportStudentsToCsv(
  students: ExportStudentRecord[],
  options: ExportOptions
): string {
  const isPublic = options.scope === "public";
  const headers = [
    "nama_lengkap",
    "nama_panggilan",
    ...(!isPublic ? ["nim"] : []),
    "program_studi",
    "foto_url",
    "cita_cita",
    "motivasi",
    "organisasi",
    "biodata",
    ...(!isPublic ? ["profil_publik", "foto_disetujui"] : []),
    "instagram",
    "linkedin",
    "github",
    "portfolio",
  ];

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return `""`;
    const sanitized = sanitizeCsvFormula(val);
    const escaped = sanitized.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = students.map((s) => {
    const photo = isPublic && !s.photoApproved ? "" : s.photoUrl || "";
    const cells = [
      escapeCell(s.name),
      escapeCell(s.nickname || ""),
      ...(!isPublic ? [escapeCell(s.studentNumber || "")] : []),
      escapeCell(s.major || "Sistem Informasi"),
      escapeCell(photo),
      escapeCell(s.dream || ""),
      escapeCell(s.motivation || ""),
      escapeCell(s.organization || ""),
      escapeCell(s.bio || ""),
      ...(!isPublic ? [escapeCell(s.isPublished ? "Ya" : "Tidak"), escapeCell(s.photoApproved ? "Ya" : "Tidak")] : []),
      escapeCell(s.instagramUrl || ""),
      escapeCell(s.linkedinUrl || ""),
      escapeCell(s.githubUrl || ""),
      escapeCell(s.portfolioUrl || ""),
    ];
    return cells.join(",");
  });

  return `\uFEFF${headers.join(",")}\r\n${rows.join("\r\n")}\r\n`;
}

// -------------------------------------------------------------
// 4. HEADER DICTIONARY & NORMALIZATION
// -------------------------------------------------------------
const HEADER_DICTIONARY: Record<keyof StudentExcelRow, string[]> = {
  nama_lengkap: ["nama_lengkap", "nama lengkap", "nama", "name", "full_name", "full name", "nama mahasiswa", "nama lengkap mahasiswa"],
  nama_panggilan: ["nama_panggilan", "nama panggilan", "panggilan", "nickname", "alias", "panggilan akrab"],
  nim: ["nim", "student_number", "student number", "nomor induk mahasiswa", "npm", "nim mahasiswa", "student id", "student_id", "id mahasiswa"],
  program_studi: ["program_studi", "program studi", "prodi", "jurusan", "major", "studi"],
  foto_url: ["foto_url", "foto url", "foto", "photo", "photo_url", "photo url", "link foto", "url foto", "upload foto", "foto profil"],
  cita_cita: ["cita_cita", "cita cita", "cita-cita", "dream", "goals", "tujuan", "impian", "mimpi", "career goal", "career goals", "aspirasi", "cita-cita / impian", "cita cita / impian", "impian / cita-cita"],
  motivasi: [
    "motivasi",
    "motivation",
    "motto",
    "moto",
    "motto hidup",
    "moto hidup",
    "motto motivasi",
    "motto / motivasi",
    "motto & motivasi",
    "motivasi / motto",
    "motivasi dan motto",
    "motto dan motivasi",
    "quotes",
    "kata motivasi",
    "kalimat motivasi",
    "personal motto",
    "motto pribadi",
    "prinsip hidup",
  ],
  organisasi: ["organisasi", "organization", "pengalaman organisasi", "komunitas", "kegiatan", "kepanitiaan"],
  biodata: [
    "biodata",
    "bio",
    "latar belakang",
    "latar_belakang",
    "latarbelakang",
    "background",
    "bio & background",
    "bio background",
    "latar belakang / bio",
    "bio / latar belakang",
    "latar belakang dan bio",
    "deskripsi",
    "deskripsi diri",
    "tentang saya",
    "tentang diri",
    "about",
    "about me",
    "biografi",
    "profil singkat",
    "profil",
    "description",
    "tentang",
  ],
  profil_publik: ["profil_publik", "profil publik", "publikasi", "status publikasi", "is_published", "published", "status", "persetujuan profil", "publikasikan"],
  foto_disetujui: ["foto_disetujui", "foto disetujui", "persetujuan foto", "photo_approved", "approved_photo", "publikasi foto", "setujui foto"],
  instagram: ["instagram", "instagram_url", "ig", "akun ig", "akun instagram"],
  linkedin: ["linkedin", "linkedin_url", "link linkedin", "akun linkedin"],
  github: ["github", "github_url", "link github", "akun github"],
  portfolio: ["portfolio", "portfolio_url", "website", "web", "portofolio", "link portofolio"],
};

export function matchHeaderToField(header: string): keyof StudentExcelRow | null {
  const norm = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!norm) return null;

  // 1. Direct slug match against known aliases
  for (const [field, aliases] of Object.entries(HEADER_DICTIONARY)) {
    if (aliases.some((a) => a.toLowerCase().replace(/[^a-z0-9]/g, "") === norm)) {
      return field as keyof StudentExcelRow;
    }
  }

  // 2. Intelligent keyword match for questions or compound headings (e.g. from Google Forms / Excel)
  const lower = header.toLowerCase();

  // Motto / Motivasi
  if (lower.includes("motto") || lower.includes("motivasi") || /\bmoto\b/.test(lower)) {
    return "motivasi";
  }

  // Latar Belakang / Bio
  if (
    lower.includes("latar belakang") ||
    lower.includes("latarbelakang") ||
    lower.includes("biodata") ||
    lower.includes("biografi") ||
    lower.includes("background") ||
    lower.includes("deskripsi diri") ||
    /\bbio\b/.test(lower)
  ) {
    return "biodata";
  }

  // Cita-cita / Impian
  if (
    lower.includes("cita") ||
    lower.includes("impian") ||
    lower.includes("dream") ||
    lower.includes("aspirasi") ||
    /\bmimpi\b/.test(lower)
  ) {
    return "cita_cita";
  }

  // Nama Lengkap vs Panggilan
  if (lower.includes("panggilan") || lower.includes("nickname") || lower.includes("alias")) {
    return "nama_panggilan";
  }
  if (lower.includes("nama lengkap") || (lower.includes("nama") && !lower.includes("organisasi") && !lower.includes("panggilan"))) {
    return "nama_lengkap";
  }

  // NIM
  if (/\bnim\b/.test(lower) || lower.includes("nomor induk") || lower.includes("student id") || lower.includes("npm")) {
    return "nim";
  }

  // Foto Approval vs Foto URL
  if (lower.includes("foto") || lower.includes("photo")) {
    if (lower.includes("setuju") || lower.includes("izin") || lower.includes("approved")) {
      return "foto_disetujui";
    }
    return "foto_url";
  }

  // Publikasi Profil
  if (lower.includes("publik") || lower.includes("publish")) {
    return "profil_publik";
  }

  // Organisasi
  if (lower.includes("organisasi") || lower.includes("komunitas") || lower.includes("kegiatan") || lower.includes("kepanitiaan")) {
    return "organisasi";
  }

  // Program Studi
  if (lower.includes("prodi") || lower.includes("jurusan") || lower.includes("program studi") || lower.includes("major")) {
    return "program_studi";
  }

  // Social Media
  if (lower.includes("instagram") || /\big\b/.test(lower)) return "instagram";
  if (lower.includes("linkedin")) return "linkedin";
  if (lower.includes("github")) return "github";
  if (lower.includes("portfolio") || lower.includes("portofolio") || lower.includes("website")) return "portfolio";

  return null;
}

// -------------------------------------------------------------
// 5. FILE PARSING (XLSX & CSV)
// -------------------------------------------------------------
export async function parseXlsxBuffer(buffer: Buffer): Promise<{ headers: string[]; rawRows: Record<string, any>[] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  // Look for sheet named "Mahasiswa" or use first worksheet
  let worksheet = workbook.getWorksheet("Mahasiswa");
  if (!worksheet) {
    worksheet = workbook.worksheets[0];
  }
  if (!worksheet) {
    throw new Error("File Excel tidak memiliki lembar kerja (worksheet) yang valid.");
  }

  const rawRows: Record<string, any>[] = [];
  const headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell, colNumber) => {
        const val = cell.value?.toString().trim() || `col_${colNumber}`;
        headers.push(val);
      });
      return;
    }

    const rowObj: Record<string, any> = {};
    let hasAnyData = false;
    headers.forEach((header, index) => {
      const cell = row.getCell(index + 1);
      let val = cell.value;
      // Handle rich text or hyperlink objects from Excel
      if (val && typeof val === "object") {
        if ("text" in val && typeof (val as any).text === "string") val = (val as any).text;
        else if ("result" in val) val = (val as any).result;
      }
      const strVal = val !== null && val !== undefined ? String(val).trim() : "";
      if (strVal) hasAnyData = true;
      rowObj[header] = strVal;
    });

    if (hasAnyData) {
      rawRows.push(rowObj);
    }
  });

  return { headers, rawRows };
}

export function parseCsvText(text: string): { headers: string[]; rawRows: Record<string, any>[] } {
  // Strip UTF-8 BOM if present
  let cleanText = text;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  // Auto-detect delimiter from first line (comma, semicolon, or tab)
  const firstLine = cleanText.split(/\r\n|\r|\n/)[0] || "";
  let delimiter = ",";
  const countComma = (firstLine.match(/,/g) || []).length;
  const countSemicolon = (firstLine.match(/;/g) || []).length;
  const countTab = (firstLine.match(/\t/g) || []).length;
  if (countSemicolon > countComma && countSemicolon > countTab) {
    delimiter = ";";
  } else if (countTab > countComma && countTab > countSemicolon) {
    delimiter = "\t";
  }

  // Robust RFC 4180 CSV parser handling multiline quotes
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentLine.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++; // skip \n
      currentLine.push(currentField.trim());
      currentField = "";
      if (currentLine.some((c) => c.length > 0)) {
        lines.push(currentLine);
      }
      currentLine = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.some((c) => c.length > 0)) {
      lines.push(currentLine);
    }
  }

  if (lines.length === 0) {
    throw new Error("File CSV kosong.");
  }

  const headers = lines[0].map((h, i) => h || `col_${i + 1}`);
  const rawRows: Record<string, any>[] = [];

  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    const rowObj: Record<string, any> = {};
    let hasData = false;
    headers.forEach((h, i) => {
      const val = line[i] || "";
      if (val) hasData = true;
      rowObj[h] = val;
    });
    if (hasData) {
      rawRows.push(rowObj);
    }
  }

  return { headers, rawRows };
}

// -------------------------------------------------------------
// 6. VALIDATION & MAPPING WORKFLOW
// -------------------------------------------------------------
export interface ExistingStudentRef {
  id: string;
  name: string;
  studentNumber?: string | null;
}

export function processAndValidateStudentRows(
  headers: string[],
  rawRows: Record<string, any>[],
  columnMapping: Record<string, keyof StudentExcelRow | "IGNORE">,
  existingStudents: ExistingStudentRef[]
): FileParseResult {
  const recognizedHeaders: string[] = [];
  const unrecognizedHeaders: string[] = [];

  headers.forEach((h) => {
    const mapped = columnMapping[h];
    if (mapped && mapped !== "IGNORE") {
      recognizedHeaders.push(h);
    } else {
      unrecognizedHeaders.push(h);
    }
  });

  const parsedRows: ParsedRowResult[] = [];
  const seenNimsInFile = new Set<string>();
  const seenNamesInFile = new Set<string>();

  rawRows.forEach((raw, idx) => {
    const rowNumber = idx + 2; // +2 accounting for 1-based index and header row
    const data: StudentExcelRow = {
      nama_lengkap: "",
      nama_panggilan: null,
      nim: null,
      program_studi: "Sistem Informasi",
      foto_url: null,
      cita_cita: null,
      motivasi: null,
      organisasi: null,
      biodata: null,
      profil_publik: false,
      foto_disetujui: false,
      instagram: null,
      linkedin: null,
      github: null,
      portfolio: null,
    };

    // Apply mapping
    for (const [header, mappedField] of Object.entries(columnMapping)) {
      if (mappedField === "IGNORE") continue;
      const val = raw[header];
      if (val !== undefined && val !== null) {
        if (mappedField === "profil_publik" || mappedField === "foto_disetujui") {
          data[mappedField] = parseBooleanFlex(val, false);
        } else if (mappedField === "portfolio") {
          const str = String(val).trim();
          data.portfolio = str.length > 0 ? formatExternalUrl(str) : null;
        } else if (mappedField === "instagram") {
          const str = String(val).trim();
          data.instagram = str.length > 0 ? formatInstagramUrl(str) : null;
        } else if (mappedField === "github") {
          const str = String(val).trim();
          data.github = str.length > 0 ? formatGithubUrl(str) : null;
        } else if (mappedField === "linkedin") {
          const str = String(val).trim();
          data.linkedin = str.length > 0 ? formatLinkedinUrl(str) : null;
        } else {
          const str = String(val).trim();
          data[mappedField] = str.length > 0 ? str : null;
        }
      }
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate Required: nama_lengkap
    if (!data.nama_lengkap || data.nama_lengkap.trim().length < 2) {
      errors.push("Nama lengkap wajib diisi (minimal 2 karakter).");
    } else if (data.nama_lengkap.toUpperCase().includes("(HAPUS BARIS INI)")) {
      warnings.push("Baris ini terdeteksi sebagai baris contoh template.");
    }

    // 2. Validate NIM length / format if provided
    if (data.nim) {
      if (data.nim.length > 30) {
        errors.push("NIM terlalu panjang (maksimal 30 karakter).");
      }
    }

    // 3. Normalize & validate photo URL
    if (data.foto_url) {
      if (!/^https?:\/\/.+/i.test(data.foto_url) && !data.foto_url.startsWith("/")) {
        warnings.push("Format URL foto profil tidak lazim (harus diawali http:// atau https://).");
      }
    }

    // 4. Duplicate check within file
    const cleanName = (data.nama_lengkap || "").trim().toLowerCase();
    const cleanNim = (data.nim || "").trim().toLowerCase();
    let isDuplicateInFile = false;

    if (cleanNim && seenNimsInFile.has(cleanNim)) {
      isDuplicateInFile = true;
      errors.push(`Duplikasi NIM '${data.nim}' terdeteksi ganda di dalam file yang sama.`);
    } else if (cleanNim) {
      seenNimsInFile.add(cleanNim);
    }

    if (cleanName && seenNamesInFile.has(cleanName)) {
      isDuplicateInFile = true;
      warnings.push(`Nama '${data.nama_lengkap}' muncul lebih dari satu kali di dalam file.`);
    } else if (cleanName) {
      seenNamesInFile.add(cleanName);
    }

    // 5. Match against existing database records
    let matchedExistingStudentId: string | null = null;
    let matchedBy: "NIM" | "NAME" | null = null;

    if (cleanNim) {
      const matchNim = existingStudents.find(
        (s) => s.studentNumber && s.studentNumber.trim().toLowerCase() === cleanNim
      );
      if (matchNim) {
        matchedExistingStudentId = matchNim.id;
        matchedBy = "NIM";
        warnings.push(`Cocok dengan mahasiswa terdaftar: ${matchNim.name} (NIM: ${matchNim.studentNumber})`);
      }
    }

    if (!matchedExistingStudentId && cleanName) {
      const matchName = existingStudents.find(
        (s) => s.name.trim().toLowerCase() === cleanName
      );
      if (matchName) {
        matchedExistingStudentId = matchName.id;
        matchedBy = "NAME";
        warnings.push(`Cocok dengan nama mahasiswa di database: '${matchName.name}'`);
      }
    }

    parsedRows.push({
      rowNumber,
      data,
      rawData: raw,
      errors,
      warnings,
      isDuplicateInFile,
      matchedExistingStudentId,
      matchedBy,
    });
  });

  const validRows = parsedRows.filter((r) => r.errors.length === 0).length;
  const invalidRows = parsedRows.filter((r) => r.errors.length > 0).length;
  const duplicateRows = parsedRows.filter((r) => r.matchedExistingStudentId !== null || r.isDuplicateInFile).length;

  return {
    headers,
    recognizedHeaders,
    unrecognizedHeaders,
    rows: parsedRows,
    summary: {
      totalRows: parsedRows.length,
      validRows,
      invalidRows,
      duplicateRows,
    },
  };
}
