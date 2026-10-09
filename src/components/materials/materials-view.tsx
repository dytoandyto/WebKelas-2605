"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  User,
  Layers,
  Sparkles,
  GraduationCap,
  FileText,
  Download,
  Eye,
  RotateCcw,
  X,
  Filter,
  FileSpreadsheet,
  Video,
  Link2,
} from "lucide-react";
import {
  MaterialData,
  getMaterialIcon,
  getMaterialTypeBadge,
  parseAttachments,
} from "./material-card";
import { MaterialDetail } from "./material-detail";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  englishName?: string | null;
  lecturerName?: string | null;
  description?: string | null;
  sks?: number | null;
  color?: string | null;
  _count?: { materials: number };
  materialSections?: Array<{
    id: string;
    title: string;
    description?: string | null;
    sortOrder: number;
  }>;
}

export interface MaterialsViewProps {
  materials: MaterialData[];
  subjects: SubjectItem[];
  initialSubjectCode?: string;
}

export function MaterialsView({
  materials,
  subjects,
  initialSubjectCode,
}: MaterialsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const querySubject = searchParams.get("subject") || initialSubjectCode;

  // Active category filter: "ALL" or subject code
  const [selectedCategory, setSelectedCategory] = useState<string>(
    querySubject ? querySubject.toUpperCase() : "ALL"
  );
  // Active material selection: "ALL" or material id
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("ALL");
  // Active format type filter: "ALL", "PDF", "PPT", "DOC", "XLS", "VIDEO", "LINK"
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const [search, setSearch] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Sync state if URL search param changes
  useEffect(() => {
    if (querySubject) {
      setSelectedCategory(querySubject.toUpperCase());
    } else {
      setSelectedCategory("ALL");
    }
    setSelectedMaterialId("ALL");
  }, [querySubject]);

  // Find active subject if a specific category is selected
  const activeSubject = useMemo(() => {
    if (selectedCategory === "ALL") return null;
    return (
      subjects.find(
        (s) =>
          s.code.toUpperCase() === selectedCategory.toUpperCase() ||
          s.id.toUpperCase() === selectedCategory.toUpperCase()
      ) || null
    );
  }, [selectedCategory, subjects]);

  // Calculate material count per subject dynamically from the actual materials data
  const subjectMaterialCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of materials) {
      const code = m.subject?.code?.toUpperCase();
      const id = m.subject?.id;
      if (code) counts[code] = (counts[code] || 0) + 1;
      if (id) counts[id] = (counts[id] || 0) + 1;
    }
    return counts;
  }, [materials]);

  // Handle subject switch
  const handleSubjectSelect = (categoryCode: string) => {
    setSelectedCategory(categoryCode);
    setSelectedMaterialId("ALL");

    if (categoryCode === "ALL") {
      router.push("/materials", { scroll: false });
    } else {
      router.push(`/materials?subject=${encodeURIComponent(categoryCode)}`, {
        scroll: false,
      });
    }
  };

  // Handle specific material select from dropdown
  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterialId(materialId);
  };

  const handleOpenDetailModal = (material: MaterialData) => {
    setSelectedMaterial(material);
    setDetailOpen(true);
  };

  const handleResetAllFilters = () => {
    setSelectedCategory("ALL");
    setSelectedMaterialId("ALL");
    setSelectedType("ALL");
    setSearch("");
    router.push("/materials", { scroll: false });
  };

  const isAnyFilterActive =
    selectedCategory !== "ALL" ||
    selectedMaterialId !== "ALL" ||
    selectedType !== "ALL" ||
    Boolean(search.trim());

  // Materials available for Dropdown 2 (Pilih Materi Kuliah)
  const availableMaterialsForSelect = useMemo(() => {
    if (selectedCategory === "ALL") {
      return materials;
    }
    return materials.filter(
      (m) =>
        m.subject?.code?.toUpperCase() === selectedCategory.toUpperCase() ||
        m.subject?.id?.toUpperCase() === selectedCategory.toUpperCase()
    );
  }, [selectedCategory, materials]);

  // The spotlight material if user picked a single material in Dropdown 2
  const spotlightMaterial = useMemo(() => {
    if (selectedMaterialId === "ALL") return null;
    return materials.find((m) => m.id === selectedMaterialId) || null;
  }, [selectedMaterialId, materials]);

  // Filter materials based on category (matkul), specific material, format, and search query
  const filteredMaterials = useMemo(() => {
    let result = materials;

    // 1. Filter by category matkul
    if (selectedCategory !== "ALL") {
      result = result.filter((m) => {
        const matchCode =
          m.subject?.code?.toUpperCase() === selectedCategory.toUpperCase();
        const matchId =
          m.subject?.id?.toUpperCase() === selectedCategory.toUpperCase();
        return matchCode || matchId;
      });
    }

    // 2. Filter by specific material ID
    if (selectedMaterialId !== "ALL") {
      result = result.filter((m) => m.id === selectedMaterialId);
    }

    // 3. Filter by format type
    if (selectedType !== "ALL") {
      result = result.filter((m) => {
        const t = (m.type || "").toString().toUpperCase();
        if (selectedType === "PPT") {
          return ["PPT", "SLIDE", "PPTX", "KEY"].includes(t);
        }
        if (selectedType === "DOC") {
          return ["DOC", "DOCX", "DOCUMENT", "TXT"].includes(t);
        }
        if (selectedType === "XLS") {
          return ["XLS", "XLSX", "SPREADSHEET", "CSV"].includes(t);
        }
        if (selectedType === "VIDEO") {
          return ["VIDEO", "MP4", "MKV", "WEBM"].includes(t);
        }
        if (selectedType === "LINK") {
          return ["LINK", "G-DRIVE", "URL"].includes(t);
        }
        return t === selectedType.toUpperCase();
      });
    }

    // 4. Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((m) => {
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchDesc = m.description?.toLowerCase().includes(q);
        const matchSubject =
          m.subject?.name?.toLowerCase().includes(q) ||
          m.subject?.code?.toLowerCase().includes(q);
        const matchSection = m.section?.title?.toLowerCase().includes(q);
        const matchTags = m.tags?.toLowerCase().includes(q);
        const matchFile = m.fileName?.toLowerCase().includes(q);
        const matchLecturer = m.subject?.lecturerName?.toLowerCase().includes(q);
        return (
          matchTitle ||
          matchDesc ||
          matchSubject ||
          matchSection ||
          matchTags ||
          matchFile ||
          matchLecturer
        );
      });
    }

    return result;
  }, [materials, selectedCategory, selectedMaterialId, selectedType, search]);

  return (
    <div className="space-y-6 text-left">
      {/* ── 1. Search Bar & Cascading Select Controls ─────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] space-y-4 shadow-xs">
        {/* Search Input & Total Counter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <Input
              placeholder="Cari judul materi, topik kuliah, dosen pengampu, atau nama berkas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-cyan-400 light:text-blue-600" />}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] self-end sm:self-auto">
            <Layers size={14} className="text-cyan-400 light:text-blue-600" />
            <span>
              {filteredMaterials.length} dari {materials.length} Berkas Materi
            </span>
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="ml-2 text-[11px] text-cyan-400 light:text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Step Cascading Selectors: [Pilih Matkul] -> [Pilih Materi] */}
        <div className="pt-3 border-t border-[var(--border-color)]/70">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Step 1: Select Mata Kuliah */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-cyan-400 light:text-blue-600" />
                  <span>1. Pilih Mata Kuliah</span>
                </span>
                {selectedCategory !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => handleSubjectSelect("ALL")}
                    className="text-[11px] text-cyan-400 light:text-blue-600 hover:underline cursor-pointer lowercase"
                  >
                    semua matkul
                  </button>
                )}
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => handleSubjectSelect(e.target.value)}
                icon={<BookOpen size={15} className="text-cyan-400 light:text-blue-600" />}
              >
                <option value="ALL">
                  Semua Mata Kuliah ({materials.length} berkas terkumpul)
                </option>
                {subjects.map((sub) => {
                  const count = subjectMaterialCounts[sub.code.toUpperCase()] || 0;
                  return (
                    <option key={sub.id} value={sub.code}>
                      {sub.code} — {sub.name} ({count} berkas)
                    </option>
                  );
                })}
              </Select>
            </div>

            {/* Step 2: Select Materi Kuliah */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText size={14} className="text-cyan-400 light:text-blue-600" />
                  <span>2. Pilih Materi Kuliah</span>
                </span>
                {selectedMaterialId !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => handleMaterialSelect("ALL")}
                    className="text-[11px] text-cyan-400 light:text-blue-600 hover:underline cursor-pointer lowercase"
                  >
                    tampilkan semua
                  </button>
                )}
              </label>
              <Select
                value={selectedMaterialId}
                onChange={(e) => handleMaterialSelect(e.target.value)}
                icon={<Layers size={15} className="text-cyan-400 light:text-blue-600" />}
              >
                <option value="ALL">
                  {selectedCategory === "ALL"
                    ? `Semua Materi (${materials.length} berkas)`
                    : `Semua Materi di ${activeSubject?.code || "Matkul ini"} (${availableMaterialsForSelect.length} berkas)`}
                </option>
                {availableMaterialsForSelect.map((m) => (
                  <option key={m.id} value={m.id}>
                    {selectedCategory === "ALL" && m.subject?.code
                      ? `[${m.subject.code}] `
                      : ""}
                    {m.section?.title ? `${m.section.title}: ` : ""}
                    {m.title} ({m.type})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Quick Format Pills */}
        <div className="pt-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1 mr-1">
            <Filter size={12} />
            <span>Format:</span>
          </span>

          {[
            { id: "ALL", label: "Semua Format" },
            { id: "PDF", label: "PDF" },
            { id: "PPT", label: "PPT / Slide" },
            { id: "DOC", label: "Word / Dokumen" },
            { id: "XLS", label: "Excel / Data" },
            { id: "VIDEO", label: "Video" },
            { id: "LINK", label: "Tautan / Drive" },
          ].map((pill) => {
            const isActive = selectedType === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSelectedType(pill.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border",
                  isActive
                    ? "bg-cyan-500/20 light:bg-blue-600 text-cyan-300 light:text-white border-cyan-400/40 light:border-blue-700 shadow-2xs"
                    : "bg-[var(--surface-primary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-cyan-400/40 hover:text-[var(--text-primary)]"
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Active Subject Banner (When a specific Matkul is selected) ── */}
      {activeSubject && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-cyan-500/25 light:border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 light:bg-blue-50 text-cyan-400 light:text-blue-700 font-mono text-xs font-bold border border-cyan-400/20 light:border-blue-200">
                {activeSubject.code}
              </span>
              <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                {activeSubject.sks || 3} SKS
              </span>
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                {activeSubject.name}
              </h2>
            </div>
            {activeSubject.lecturerName && (
              <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                <User size={13} className="text-cyan-400 light:text-blue-600" />
                <span>
                  Dosen Pengampu: <strong>{activeSubject.lecturerName}</strong>
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubjectSelect("ALL")}
              className="text-xs cursor-pointer text-cyan-400 light:text-blue-600"
            >
              <RotateCcw size={12} className="mr-1.5" />
              <span>Tampilkan Semua Matkul</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── 3. Spotlight Card (When a single Material is selected in Step 2) ─ */}
      {spotlightMaterial && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-cyan-400/40 light:border-blue-400/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Materi Terpilih</span>
            </span>
            <button
              type="button"
              onClick={() => handleMaterialSelect("ALL")}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer flex items-center gap-1"
            >
              <X size={12} />
              <span>Tampilkan semua materi</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 light:bg-blue-50 border border-cyan-400/20 light:border-blue-200 flex items-center justify-center shrink-0">
                {getMaterialIcon(spotlightMaterial.type)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-cyan-500/20 text-cyan-300 light:bg-blue-100 light:text-blue-700">
                    {spotlightMaterial.subject?.code}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    {spotlightMaterial.title}
                  </h4>
                  {getMaterialTypeBadge(spotlightMaterial.type)}
                  {spotlightMaterial.fileSize && (
                    <span className="font-mono text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-slate-800/60 light:bg-slate-100 border border-[var(--border-color)]">
                      {spotlightMaterial.fileSize}
                    </span>
                  )}
                </div>
                {spotlightMaterial.description && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {spotlightMaterial.description}
                  </p>
                )}
                {spotlightMaterial.section?.title && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 light:text-blue-700">
                    Submateri: {spotlightMaterial.section.title}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
              {(spotlightMaterial.fileUrl || spotlightMaterial.externalUrl) && (
                <a
                  href={spotlightMaterial.fileUrl || spotlightMaterial.externalUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Download size={13} />
                  <span>Buka / Unduh File</span>
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDetailModal(spotlightMaterial)}
                className="text-xs cursor-pointer"
              >
                <Eye size={13} className="mr-1" />
                <span>Detail</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Main Aggregated Files Table (Semua Matkul Terkumpul Di Sini) ── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {activeSubject
                  ? `Berkas Materi ${activeSubject.name}`
                  : "Semua Berkas Materi Kuliah"}
              </h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-primary)] border border-[var(--border-color)] text-[var(--text-muted)]">
                {filteredMaterials.length} Berkas
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {activeSubject
                ? `Menampilkan materi kuliah khusus untuk ${activeSubject.name} (${activeSubject.code}).`
                : "Seluruh modul perkuliahan, slide dosen, dan bahan ajar dari semua mata kuliah."}
            </p>
          </div>

          {isAnyFilterActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAllFilters}
              className="text-xs self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw size={12} className="mr-1.5" />
              <span>Reset Semua Filter</span>
            </Button>
          )}
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)]/40">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--surface-primary)] text-[var(--text-secondary)] font-mono uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3.5 w-12 text-center">#</th>
                <th className="py-3 px-3.5 w-28">Matkul</th>
                <th className="py-3 px-3.5">Judul Materi</th>
                <th className="py-3 px-3.5 w-24 text-center">Format</th>
                <th className="py-3 px-3.5 hidden sm:table-cell">Submateri</th>
                <th className="py-3 px-3.5 w-24 text-center hidden md:table-cell">Ukuran</th>
                <th className="py-3 px-3.5 w-36 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/70">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <BookOpen className="w-8 h-8 text-cyan-400 light:text-blue-600 mx-auto opacity-70" />
                      <p className="font-semibold text-sm text-[var(--text-primary)]">
                        Tidak ada berkas materi yang sesuai
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Coba ubah kata kunci pencarian, pilih mata kuliah lain, atau reset filter.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetAllFilters}
                        className="text-xs mt-2"
                      >
                        Reset Filter
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((m, idx) => {
                  const attachments = parseAttachments(m.attachments);
                  const downloadUrl =
                    m.fileUrl || m.externalUrl || attachments[0]?.url;
                  const totalAttachments = attachments.length;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => handleOpenDetailModal(m)}
                      className={cn(
                        "transition-colors group cursor-pointer",
                        m.id === selectedMaterialId
                          ? "bg-cyan-500/15 light:bg-blue-50/90 font-medium"
                          : "hover:bg-[var(--primary)]/5"
                      )}
                    >
                      {/* # Number */}
                      <td className="py-3 px-3.5 text-center font-mono text-[var(--text-muted)] text-xs">
                        {idx + 1}
                      </td>

                      {/* Matkul Badge */}
                      <td className="py-3 px-3.5">
                        {m.subject ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubjectSelect(m.subject?.code || "ALL");
                            }}
                            className={cn(
                              "px-2 py-0.5 rounded-md font-mono text-xs font-bold border transition-colors cursor-pointer",
                              selectedCategory.toUpperCase() === m.subject.code.toUpperCase()
                                ? "bg-cyan-500/25 light:bg-blue-600 text-cyan-300 light:text-white border-cyan-400/40"
                                : "bg-cyan-500/10 light:bg-blue-50 text-cyan-400 light:text-blue-700 border-cyan-400/20 light:border-blue-200 hover:bg-cyan-500/20"
                            )}
                            title={`Filter materi: ${m.subject.name}`}
                          >
                            {m.subject.code}
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-[var(--text-muted)]">-</span>
                        )}
                      </td>

                      {/* Judul & Deskripsi */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="shrink-0">{getMaterialIcon(m.type)}</span>
                          <div className="min-w-0">
                            <div className="font-semibold text-[var(--text-primary)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors flex items-center gap-1.5 flex-wrap">
                              <span>{m.title}</span>
                              {totalAttachments > 1 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 light:bg-blue-100 light:text-blue-700 border border-cyan-500/30">
                                  +{totalAttachments} file
                                </span>
                              )}
                            </div>
                            {m.description && (
                              <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                                {m.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Format Badge */}
                      <td className="py-3 px-3.5 text-center">
                        {getMaterialTypeBadge(m.type)}
                      </td>

                      {/* Submateri */}
                      <td className="py-3 px-3.5 hidden sm:table-cell font-mono text-xs text-[var(--text-secondary)]">
                        {m.section?.title || "-"}
                      </td>

                      {/* Ukuran */}
                      <td className="py-3 px-3.5 text-center hidden md:table-cell font-mono text-xs text-[var(--text-muted)]">
                        {m.fileSize || "-"}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {downloadUrl && (
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xs hover:opacity-90 transition-opacity"
                              title="Buka / Unduh Berkas"
                            >
                              <Download size={12} />
                              <span className="hidden sm:inline">Unduh</span>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(m)}
                            className="text-xs text-cyan-400 light:text-blue-600 hover:bg-cyan-500/10 cursor-pointer"
                          >
                            <Eye size={12} className="mr-1" />
                            <span>Detail</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Material Detail Modal ──────────────────────────────────────── */}
      <MaterialDetail
        material={selectedMaterial}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
