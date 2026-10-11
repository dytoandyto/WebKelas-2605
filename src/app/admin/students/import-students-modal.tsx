"use client";

import React, { useState, useRef, useTransition } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  Download,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { cn } from "@/lib/utils";
import {
  StudentExcelRow,
  ImportStrategy,
  ImportExecutionResult,
  ExistingStudentRef,
  FileParseResult,
  processAndValidateStudentRows,
} from "@/lib/excel/student-excel";
import { parseStudentFileAction, importStudentsBatchAction } from "@/lib/actions/students";

interface ImportStudentsModalProps {
  open: boolean;
  onClose: () => void;
  onImportCompleted: () => void;
  existingStudents: Array<{ id: string; name: string; studentNumber?: string | null }>;
}

type WizardStep = "UPLOAD" | "MAPPING" | "PREVIEW" | "REPORT";

const AVAILABLE_TARGET_FIELDS: Array<{ key: keyof StudentExcelRow | "IGNORE"; label: string; required?: boolean }> = [
  { key: "nama_lengkap", label: "Nama Lengkap (Wajib)", required: true },
  { key: "nama_panggilan", label: "Nama Panggilan" },
  { key: "nim", label: "NIM (Arsip Internal)" },
  { key: "program_studi", label: "Program Studi" },
  { key: "foto_url", label: "URL Foto Profil" },
  { key: "cita_cita", label: "Cita-cita / Impian" },
  { key: "motivasi", label: "Motto / Motivasi" },
  { key: "organisasi", label: "Pengalaman Organisasi" },
  { key: "biodata", label: "Bio / Latar Belakang" },
  { key: "profil_publik", label: "Status Publikasi (Ya/Tidak)" },
  { key: "foto_disetujui", label: "Persetujuan Foto (Ya/Tidak)" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "portfolio", label: "Portofolio" },
  { key: "IGNORE", label: "— Abaikan Kolom Ini —" },
];

export function ImportStudentsModal({
  open,
  onClose,
  onImportCompleted,
  existingStudents,
}: ImportStudentsModalProps) {
  const [step, setStep] = useState<WizardStep>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Parsed File State
  const [fileName, setFileName] = useState("");
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, keyof StudentExcelRow | "IGNORE">>({});
  const [parseResult, setParseResult] = useState<FileParseResult | null>(null);

  // Strategy & Execution
  const [strategy, setStrategy] = useState<ImportStrategy>("UPDATE_MATCHED");
  const [isPending, startTransition] = useTransition();
  const [executionResult, setExecutionResult] = useState<ImportExecutionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function resetState() {
    setStep("UPLOAD");
    setFile(null);
    setUploadLoading(false);
    setUploadError(null);
    setFileName("");
    setFileHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setParseResult(null);
    setStrategy("UPDATE_MATCHED");
    setExecutionResult(null);
  }

  function handleModalClose() {
    resetState();
    onClose();
  }

  // ---------------- 1. UPLOAD HANDLER ----------------
  async function handleFileSelected(selectedFile: File) {
    if (!selectedFile) return;

    const ext = selectedFile.name.toLowerCase();
    if (!ext.endsWith(".xlsx") && !ext.endsWith(".csv")) {
      setUploadError("Format file tidak didukung. Harap pilih file berekstensi .xlsx atau .csv.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 5 MB.");
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await parseStudentFileAction(formData);
      if (!res.success || !res.data) {
        throw new Error(res.error || "Gagal membaca struktur file.");
      }

      setFileName(res.data.fileName);
      setFileHeaders(res.data.headers);
      setRawRows(res.data.rawRows);
      setColumnMapping(res.data.suggestedMapping);

      // Immediately process validation using suggested mapping
      const validated = processAndValidateStudentRows(
        res.data.headers,
        res.data.rawRows,
        res.data.suggestedMapping,
        existingStudents
      );
      setParseResult(validated);
      setStep("MAPPING");
    } catch (err: any) {
      setUploadError(err.message || "Gagal memproses file spreadsheet.");
    } finally {
      setUploadLoading(false);
    }
  }

  // ---------------- 2. MAPPING CHANGE ----------------
  function handleMappingChange(header: string, targetField: keyof StudentExcelRow | "IGNORE") {
    const updatedMapping = { ...columnMapping, [header]: targetField };
    setColumnMapping(updatedMapping);

    // Re-validate rows immediately
    const validated = processAndValidateStudentRows(
      fileHeaders,
      rawRows,
      updatedMapping,
      existingStudents
    );
    setParseResult(validated);
  }

  // ---------------- 3. EXECUTE IMPORT ----------------
  function handleExecuteImport() {
    if (!parseResult) return;

    // Filter valid rows (excluding rows with fatal errors)
    const validRowsToImport = parseResult.rows
      .filter((r) => r.errors.length === 0)
      .map((r) => r.data);

    if (validRowsToImport.length === 0) {
      setUploadError("Tidak ada baris data valid yang dapat disimpan.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await importStudentsBatchAction(validRowsToImport, strategy);
        if (!res.success || !res.data) {
          throw new Error(res.error || "Gagal menjalankan impor mahasiswa.");
        }

        setExecutionResult(res.data);
        setStep("REPORT");
        onImportCompleted();
      } catch (err: any) {
        setUploadError(err.message || "Terjadi kesalahan saat menyimpan data ke database.");
      }
    });
  }

  // ---------------- 4. DOWNLOAD REPORT ----------------
  function handleDownloadReport() {
    if (!executionResult) return;

    const headers = ["Baris", "Nama Mahasiswa", "NIM", "Status", "Keterangan"];
    const rows = executionResult.rowReports.map((r) => [
      r.rowNumber,
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${(r.nim || "").replace(/"/g, '""')}"`,
      r.status,
      `"${(r.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvText = `\uFEFF${headers.join(",")}\r\n${rows.map((row) => row.join(",")).join("\r\n")}\r\n`;
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Impor_Mahasiswa_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      onClose={handleModalClose}
      title="Import Data Mahasiswa (Excel / CSV)"
      description="Impor puluhan profil mahasiswa sekaligus dengan verifikasi, pemetaan kolom, dan pencegahan duplikasi."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-1 sm:gap-2 text-xs font-semibold">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full transition-colors",
                step === "UPLOAD"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}
            >
              1. Upload
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full transition-colors",
                step === "MAPPING"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}
            >
              2. Mapping
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full transition-colors",
                step === "PREVIEW"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}
            >
              3. Preview
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full transition-colors",
                step === "REPORT"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}
            >
              4. Laporan
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {fileName && <span>File: {fileName}</span>}
          </div>
        </div>

        {uploadError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{uploadError}</div>
            <button
              onClick={() => setUploadError(null)}
              className="p-0.5 text-rose-400 hover:text-rose-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ---------------- STEP 1: UPLOAD ---------------- */}
        {step === "UPLOAD" && (
          <div className="space-y-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) handleFileSelected(droppedFile);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200",
                "border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-400 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-blue-50/30 dark:hover:bg-cyan-950/20"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelected(f);
                }}
              />

              {uploadLoading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={36} className="animate-spin text-blue-600 dark:text-cyan-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Menganalisis & memvalidasi file spreadsheet...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 shadow-sm">
                    <FileSpreadsheet size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Klik atau seret file Excel (.xlsx) / CSV (.csv) ke sini
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Maksimal ukuran file 5 MB. Mendukung file hasil unduhan Google Sheets / Forms.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Template Quick Links */}
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <HelpCircle size={16} className="text-blue-500 dark:text-cyan-400 flex-shrink-0" />
                <span>Belum memiliki file? Unduh template resmi dengan petunjuk pengisian:</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/api/admin/students/template?format=xlsx"
                  className="px-3 py-1.5 rounded-lg font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Template .XLSX</span>
                </a>
                <a
                  href="/api/admin/students/template?format=csv"
                  className="px-3 py-1.5 rounded-lg font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Template .CSV</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- STEP 2: COLUMN MAPPING ---------------- */}
        {step === "MAPPING" && parseResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pemetaan Kolom Spreadsheet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Periksa kecocokan kolom di file Anda dengan kolom profil ClassHub.
                </p>
              </div>
              <div className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {rawRows.length} baris terdeteksi
              </div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/80">
              {fileHeaders.map((header) => {
                const currentMapped = columnMapping[header] || "IGNORE";
                const isMatched = currentMapped !== "IGNORE";

                return (
                  <div
                    key={header}
                    className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          isMatched ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                        )}
                      />
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {header}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Petakan ke:</span>
                      <select
                        value={currentMapped}
                        onChange={(e) =>
                          handleMappingChange(header, e.target.value as keyof StudentExcelRow | "IGNORE")
                        }
                        className={cn(
                          "text-xs px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-900 font-medium",
                          isMatched
                            ? "border-blue-300 dark:border-cyan-500/40 text-blue-700 dark:text-cyan-300"
                            : "border-slate-200 dark:border-slate-700 text-slate-500"
                        )}
                      >
                        {AVAILABLE_TARGET_FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("UPLOAD")}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Pilih File Lain</span>
              </button>

              <button
                type="button"
                onClick={() => setStep("PREVIEW")}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 dark:bg-cyan-500 text-white hover:bg-blue-700 dark:hover:bg-cyan-600 shadow-sm flex items-center gap-1.5"
              >
                <span>Lihat Preview Data</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ---------------- STEP 3: PREVIEW & STRATEGY ---------------- */}
        {step === "PREVIEW" && parseResult && (
          <div className="space-y-5">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Baris</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {parseResult.summary.totalRows}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Valid</div>
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {parseResult.summary.validRows}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Cocok / Duplikat</div>
                <div className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                  {parseResult.summary.duplicateRows}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
                <div className="text-xs text-rose-700 dark:text-rose-400 font-semibold">Error</div>
                <div className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                  {parseResult.summary.invalidRows}
                </div>
              </div>
            </div>

            {/* Storage Strategy Selector */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Pilih Strategi Penyimpanan:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer text-xs transition-all flex flex-col gap-1",
                    strategy === "UPDATE_MATCHED"
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                  )}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === "UPDATE_MATCHED"}
                      onChange={() => setStrategy("UPDATE_MATCHED")}
                      className="accent-blue-600"
                    />
                    <span>Perbarui Data Cocok</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">
                    Update data profil yang cocok (berdasarkan NIM/Nama), dan tambahkan mahasiswa baru.
                  </span>
                </label>

                <label
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer text-xs transition-all flex flex-col gap-1",
                    strategy === "CREATE_ONLY"
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                  )}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === "CREATE_ONLY"}
                      onChange={() => setStrategy("CREATE_ONLY")}
                      className="accent-blue-600"
                    />
                    <span>Hanya Tambah Baru</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">
                    Hanya menambahkan record yang belum pernah ada. Lewati record yang sudah ada.
                  </span>
                </label>

                <label
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer text-xs transition-all flex flex-col gap-1",
                    strategy === "SKIP_DUPLICATES"
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                  )}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === "SKIP_DUPLICATES"}
                      onChange={() => setStrategy("SKIP_DUPLICATES")}
                      className="accent-blue-600"
                    />
                    <span>Lewati Duplikat</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">
                    Jangan sentuh data yang cocok, hanya simpan mahasiswa baru yang unik.
                  </span>
                </label>
              </div>
            </div>

            {/* Table Preview */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="max-h-[40vh] overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Baris</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3">Panggilan</th>
                      <th className="py-2.5 px-3">NIM</th>
                      <th className="py-2.5 px-3">Bio / Latar Belakang</th>
                      <th className="py-2.5 px-3">Impian & Cita-cita</th>
                      <th className="py-2.5 px-3">Motto / Motivasi</th>
                      <th className="py-2.5 px-3">Publikasi</th>
                      <th className="py-2.5 px-3">Foto</th>
                      <th className="py-2.5 px-3">Catatan / Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {parseResult.rows.map((row) => {
                      const hasError = row.errors.length > 0;
                      const hasMatch = row.matchedExistingStudentId !== null;
                      const isDupInFile = row.isDuplicateInFile;

                      return (
                        <tr
                          key={row.rowNumber}
                          className={cn(
                            "hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors",
                            hasError && "bg-rose-50/40 dark:bg-rose-950/20"
                          )}
                        >
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                            {row.rowNumber}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {hasError ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                                <XCircle size={10} /> Error
                              </span>
                            ) : hasMatch ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                <RefreshCw size={10} /> Cocok DB
                              </span>
                            ) : isDupInFile ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                Ganda File
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                <CheckCircle2 size={10} /> Baru
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {row.data.nama_lengkap || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {row.data.nama_panggilan || "—"}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {row.data.nim || "—"}
                          </td>
                          <td className="py-2.5 px-3 max-w-[150px] truncate text-slate-600 dark:text-slate-300" title={row.data.biodata || ""}>
                            {row.data.biodata || <span className="text-slate-400 italic">—</span>}
                          </td>
                          <td className="py-2.5 px-3 max-w-[140px] truncate text-slate-600 dark:text-slate-300" title={row.data.cita_cita || ""}>
                            {row.data.cita_cita || <span className="text-slate-400 italic">—</span>}
                          </td>
                          <td className="py-2.5 px-3 max-w-[140px] truncate text-slate-600 dark:text-slate-300 italic" title={row.data.motivasi || ""}>
                            {row.data.motivasi || <span className="text-slate-400 italic not-italic">—</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.data.profil_publik ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                <Eye size={12} /> Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <EyeOff size={12} /> Draft
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.data.foto_disetujui ? (
                              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                                Disetujui
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Belum
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px]">
                            {row.errors.length > 0 && (
                              <div className="text-rose-600 dark:text-rose-400 font-medium">
                                {row.errors.join(", ")}
                              </div>
                            )}
                            {row.warnings.length > 0 && (
                              <div className="text-amber-600 dark:text-amber-400">
                                {row.warnings.join(", ")}
                              </div>
                            )}
                            {row.errors.length === 0 && row.warnings.length === 0 && (
                              <span className="text-slate-400">Siap disimpan</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("MAPPING")}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Ubah Mapping Kolom</span>
              </button>

              <button
                type="button"
                disabled={isPending || parseResult.summary.validRows === 0}
                onClick={handleExecuteImport}
                className={cn(
                  "px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 dark:bg-cyan-500 text-white shadow-sm flex items-center gap-2",
                  "hover:bg-blue-700 dark:hover:bg-cyan-600 active:scale-95 transition-all",
                  "disabled:opacity-50 disabled:pointer-events-none"
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <span>Konfirmasi & Simpan ({parseResult.summary.validRows} Data)</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ---------------- STEP 4: REPORT ---------------- */}
        {step === "REPORT" && executionResult && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Proses Impor Mahasiswa Selesai
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Data mahasiswa telah berhasil diproses sesuai strategi yang dipilih.
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Mahasiswa Baru</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  +{executionResult.createdCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
                <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold">Diperbarui</div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                  {executionResult.updatedCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Dilewati</div>
                <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {executionResult.skippedCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
                <div className="text-xs text-rose-700 dark:text-rose-400 font-semibold">Gagal</div>
                <div className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                  {executionResult.failedCount}
                </div>
              </div>
            </div>

            {/* Row-by-Row Execution Report */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="max-h-[35vh] overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Baris</th>
                      <th className="py-2.5 px-3">Nama</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Detail Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {executionResult.rowReports.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">
                          {r.rowNumber}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {r.name}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {r.status === "CREATED" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                              Dibuat
                            </span>
                          )}
                          {r.status === "UPDATED" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                              Diperbarui
                            </span>
                          )}
                          {r.status === "SKIPPED" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              Dilewati
                            </span>
                          )}
                          {r.status === "FAILED" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                              Gagal
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                          {r.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Unduh Laporan Hasil (.csv)</span>
              </button>

              <button
                type="button"
                onClick={handleModalClose}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
