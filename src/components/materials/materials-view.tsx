"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  User,
  Layers,
  Sparkles,
  FolderOpen,
  Filter,
  CheckCircle2,
  GraduationCap,
  FileText,
  Download,
  ExternalLink,
  ChevronRight,
  Eye,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { MaterialData, getMaterialIcon, getMaterialTypeBadge } from "./material-card";
import { MaterialDetail } from "./material-detail";
import { MaterialSectionGroup } from "./material-section-group";
import { MaterialRow } from "./material-row";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, cn } from "@/lib/utils";

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

  // Active category filter: "ALL" or subject code/id
  const [selectedCategory, setSelectedCategory] = useState<string>(
    querySubject ? querySubject.toUpperCase() : "ALL"
  );
  // Active material selection within the chosen subject: "ALL" or material id
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("ALL");

  const [search, setSearch] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialData | null>(
    null
  );
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

  // Materials belonging to the active subject (for the 2nd dropdown selector)
  const activeSubjectMaterials = useMemo(() => {
    if (!activeSubject) return [];
    return materials.filter(
      (m) =>
        m.subject?.code?.toUpperCase() === activeSubject.code.toUpperCase() ||
        m.subject?.id === activeSubject.id
    );
  }, [activeSubject, materials]);

  // The spotlight material if user picked a single material in Dropdown 2
  const spotlightMaterial = useMemo(() => {
    if (selectedMaterialId === "ALL") return null;
    return materials.find((m) => m.id === selectedMaterialId) || null;
  }, [selectedMaterialId, materials]);

  // Filter materials based on category and search query
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

    // 2. Filter by search query
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
        return (
          matchTitle ||
          matchDesc ||
          matchSubject ||
          matchSection ||
          matchTags ||
          matchFile
        );
      });
    }

    return result;
  }, [materials, selectedCategory, search]);

  // Filter subjects for the table if search query exists
  const filteredSubjectsForTable = useMemo(() => {
    if (!search.trim()) return subjects;
    const q = search.toLowerCase().trim();
    return subjects.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.lecturerName?.toLowerCase().includes(q) ||
        s.englishName?.toLowerCase().includes(q)
    );
  }, [subjects, search]);

  // Group materials by Submateri / Section when a single subject is selected
  const singleSubjectSections = useMemo(() => {
    if (!activeSubject) return [];

    const dbSections = [...(activeSubject.materialSections || [])].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    const result: Array<{
      id: string;
      title: string;
      description?: string | null;
      materials: MaterialData[];
    }> = [];

    const assignedMaterialIds = new Set<string>();

    for (const sec of dbSections) {
      const secMaterials = filteredMaterials.filter(
        (m) => m.sectionId === sec.id || m.section?.id === sec.id
      );
      secMaterials.forEach((m) => assignedMaterialIds.add(m.id));
      if (secMaterials.length > 0) {
        result.push({
          id: sec.id,
          title: sec.title,
          description: sec.description,
          materials: secMaterials,
        });
      }
    }

    // Unassigned materials or general materials
    const generalMaterials = filteredMaterials.filter(
      (m) => !assignedMaterialIds.has(m.id)
    );

    if (generalMaterials.length > 0) {
      result.push({
        id: "general",
        title:
          dbSections.length > 0
            ? "Materi Tambahan & Referensi"
            : "Bahan Ajar & Modul Perkuliahan",
        description: "Dokumen materi pembelajaran kelas",
        materials: generalMaterials,
      });
    }

    return result;
  }, [activeSubject, filteredMaterials]);

  // Group materials by Subject -> Submateri when "ALL" is selected
  const allSubjectsGrouped = useMemo(() => {
    if (selectedCategory !== "ALL") return [];

    const subjectMap = new Map<
      string,
      { subject: SubjectItem; materials: MaterialData[] }
    >();

    for (const sub of subjects) {
      const subMats = filteredMaterials.filter(
        (m) =>
          m.subject?.code?.toUpperCase() === sub.code.toUpperCase() ||
          m.subject?.id === sub.id
      );
      if (subMats.length > 0) {
        subjectMap.set(sub.id, { subject: sub, materials: subMats });
      }
    }

    const groups: Array<{
      subject: SubjectItem;
      sections: Array<{
        id: string;
        title: string;
        description?: string | null;
        materials: MaterialData[];
      }>;
    }> = [];

    subjectMap.forEach(({ subject, materials: subMats }) => {
      const dbSections = [...(subject.materialSections || [])].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );

      const sections: Array<{
        id: string;
        title: string;
        description?: string | null;
        materials: MaterialData[];
      }> = [];

      const assignedIds = new Set<string>();

      for (const sec of dbSections) {
        const secMats = subMats.filter(
          (m) => m.sectionId === sec.id || m.section?.id === sec.id
        );
        secMats.forEach((m) => assignedIds.add(m.id));
        if (secMats.length > 0) {
          sections.push({
            id: sec.id,
            title: sec.title,
            description: sec.description,
            materials: secMats,
          });
        }
      }

      const remainder = subMats.filter((m) => !assignedIds.has(m.id));
      if (remainder.length > 0) {
        sections.push({
          id: `${subject.id}-general`,
          title:
            dbSections.length > 0
              ? "Materi Tambahan & Referensi"
              : "Bahan Ajar & Modul",
          description: null,
          materials: remainder,
        });
      }

      groups.push({ subject, sections });
    });

    return groups;
  }, [selectedCategory, subjects, filteredMaterials]);

  return (
    <div className="space-y-8 text-left">
      {/* ── 1. Search Bar & Cascading Select Controls ─────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] space-y-4 shadow-xs">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <Input
              placeholder="Cari materi kuliah, judul, topik, atau dosen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-cyan-400 light:text-blue-600" />}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] self-end sm:self-auto">
            <Layers size={14} className="text-cyan-400 light:text-blue-600" />
            <span>
              {filteredMaterials.length} dari {materials.length} Materi Kuliah
            </span>
          </div>
        </div>

        {/* 2-Step Cascading Selectors: [Select Matkul] -> [Select Materi] */}
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
                    reset
                  </button>
                )}
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => handleSubjectSelect(e.target.value)}
                icon={<BookOpen size={15} className="text-cyan-400 light:text-blue-600" />}
              >
                <option value="ALL">
                  Semua Mata Kuliah ({subjects.length} matkul terdaftar)
                </option>
                {subjects.map((sub) => {
                  const count = subjectMaterialCounts[sub.code.toUpperCase()] || 0;
                  return (
                    <option key={sub.id} value={sub.code}>
                      {sub.code} — {sub.name} ({count} materi)
                    </option>
                  );
                })}
              </Select>
            </div>

            {/* Step 2: Select Materi Kuliah (Enabled after selecting a Matkul) */}
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
                    semua materi
                  </button>
                )}
              </label>
              <Select
                value={selectedMaterialId}
                onChange={(e) => handleMaterialSelect(e.target.value)}
                disabled={selectedCategory === "ALL" || activeSubjectMaterials.length === 0}
                icon={<Layers size={15} className="text-cyan-400 light:text-blue-600" />}
              >
                {selectedCategory === "ALL" ? (
                  <option value="ALL">Pilih mata kuliah terlebih dahulu</option>
                ) : activeSubjectMaterials.length === 0 ? (
                  <option value="ALL">Belum ada materi untuk mata kuliah ini</option>
                ) : (
                  <>
                    <option value="ALL">
                      Semua Materi di {activeSubject?.code} ({activeSubjectMaterials.length} materi)
                    </option>
                    {activeSubjectMaterials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.section?.title ? `[${m.section.title}] ` : ""}
                        {m.title} ({m.type})
                      </option>
                    ))}
                  </>
                )}
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Tabel Semua Mata Kuliah ("munculin semua matkul dalam bentuk table") */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Daftar Mata Kuliah Kelas
              </h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-primary)] border border-[var(--border-color)] text-[var(--text-muted)]">
                {subjects.length} Matkul
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Klik baris mata kuliah pada tabel untuk memilih matkul dan membuka materi kuliahnya.
            </p>
          </div>

          {selectedCategory !== "ALL" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubjectSelect("ALL")}
              className="text-xs self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw size={13} className="mr-1.5" />
              <span>Tampilkan Semua Matkul</span>
            </Button>
          )}
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)]/40">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--surface-primary)] text-[var(--text-secondary)] font-mono uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3.5 w-12 text-center">#</th>
                <th className="py-3 px-3.5 w-28">Kode</th>
                <th className="py-3 px-3.5">Mata Kuliah</th>
                <th className="py-3 px-3.5 w-20 text-center">SKS</th>
                <th className="py-3 px-3.5 hidden md:table-cell">Dosen Pengampu</th>
                <th className="py-3 px-3.5 w-28 text-center hidden sm:table-cell">Submateri</th>
                <th className="py-3 px-3.5 w-28 text-center">Materi</th>
                <th className="py-3 px-3.5 w-28 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/70">
              {filteredSubjectsForTable.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--text-muted)] font-mono text-xs">
                    Mata kuliah tidak ditemukan untuk pencarian "{search}".
                  </td>
                </tr>
              ) : (
                filteredSubjectsForTable.map((sub, idx) => {
                  const isSelected =
                    selectedCategory.toUpperCase() === sub.code.toUpperCase() ||
                    selectedCategory.toUpperCase() === sub.id.toUpperCase();
                  const count = subjectMaterialCounts[sub.code.toUpperCase()] || 0;
                  const sectionsCount = sub.materialSections?.length || 0;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => handleSubjectSelect(isSelected ? "ALL" : sub.code)}
                      className={cn(
                        "transition-colors cursor-pointer group",
                        isSelected
                          ? "bg-cyan-500/10 light:bg-blue-50/90 font-medium"
                          : "hover:bg-[var(--primary)]/5"
                      )}
                    >
                      {/* # Number */}
                      <td className="py-3 px-3.5 text-center font-mono text-[var(--text-muted)] text-xs">
                        {idx + 1}
                      </td>

                      {/* Code Badge */}
                      <td className="py-3 px-3.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md font-mono text-xs font-bold border",
                            isSelected
                              ? "bg-cyan-500/20 light:bg-blue-600 text-cyan-400 light:text-white border-cyan-400/30 light:border-blue-700"
                              : "bg-[var(--surface-card)] text-cyan-400 light:text-blue-700 border-[var(--border-color)]"
                          )}
                        >
                          {sub.code}
                        </span>
                      </td>

                      {/* Subject Name */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-[var(--text-primary)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors">
                          {sub.name}
                        </div>
                        {sub.englishName && (
                          <div className="text-[11px] text-[var(--text-muted)] italic hidden sm:block">
                            {sub.englishName}
                          </div>
                        )}
                      </td>

                      {/* SKS */}
                      <td className="py-3 px-3.5 text-center font-mono text-xs text-[var(--text-secondary)]">
                        {sub.sks || 3}
                      </td>

                      {/* Dosen */}
                      <td className="py-3 px-3.5 hidden md:table-cell text-xs text-[var(--text-secondary)]">
                        {sub.lecturerName ? (
                          <span className="flex items-center gap-1.5">
                            <User size={13} className="text-cyan-400 light:text-blue-600 shrink-0" />
                            <span className="truncate max-w-[200px]">{sub.lecturerName}</span>
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">-</span>
                        )}
                      </td>

                      {/* Submateri Count */}
                      <td className="py-3 px-3.5 text-center hidden sm:table-cell">
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                          {sectionsCount > 0 ? `${sectionsCount} Bab` : "Umum"}
                        </span>
                      </td>

                      {/* Material Count */}
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold",
                            count > 0
                              ? "bg-cyan-500/10 light:bg-blue-50 text-cyan-400 light:text-blue-700 border border-cyan-400/20 light:border-blue-200"
                              : "bg-slate-800/40 light:bg-slate-100 text-[var(--text-muted)]"
                          )}
                        >
                          {count} Materi
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 light:bg-blue-600 text-cyan-300 light:text-white">
                            <CheckCircle2 size={13} />
                            <span className="hidden sm:inline">Terpilih</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-cyan-400 light:text-blue-600 group-hover:underline font-semibold">
                            <span>Pilih</span>
                            <ChevronRight size={13} />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Active Subject Info & Material Spotlight (When a Matkul is Selected) */}
      {activeSubject && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-cyan-500/20 light:border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
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
              variant="ghost"
              size="sm"
              onClick={() => handleSubjectSelect("ALL")}
              className="text-xs cursor-pointer text-cyan-400 light:text-blue-600"
            >
              Lihat Semua Matkul &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* Spotlight Card if user specifically selected a single material from Dropdown 2 */}
      {spotlightMaterial && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-cyan-400/40 light:border-blue-400/50 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Materi Terpilih</span>
            </span>
            <button
              type="button"
              onClick={() => handleMaterialSelect("ALL")}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Tampilkan semua materi
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 light:bg-blue-50 border border-cyan-400/20 light:border-blue-200 flex items-center justify-center shrink-0">
                {getMaterialIcon(spotlightMaterial.type)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
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

      {/* ── 4. Tabel Berkas Materi Kuliah ──────────────────────────────────── */}
      {activeSubject ? (
        activeSubjectMaterials.length > 0 ? (
          <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] space-y-3.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    Berkas Materi {activeSubject.name}
                  </h3>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-primary)] border border-[var(--border-color)] text-[var(--text-muted)]">
                    {activeSubjectMaterials.length} Berkas
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Modul perkuliahan, slide presentasi dosen, dan bahan ajar yang dapat diunduh.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)]/40">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--surface-primary)] text-[var(--text-secondary)] font-mono uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-3.5 w-12 text-center">#</th>
                    <th className="py-3 px-3.5">Judul Materi</th>
                    <th className="py-3 px-3.5 w-24 text-center">Tipe</th>
                    <th className="py-3 px-3.5 hidden sm:table-cell">Submateri</th>
                    <th className="py-3 px-3.5 w-24 text-center hidden md:table-cell">Ukuran</th>
                    <th className="py-3 px-3.5 w-36 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/70">
                  {activeSubjectMaterials.map((m, idx) => (
                    <tr
                      key={m.id}
                      onClick={() => handleOpenDetailModal(m)}
                      className="hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-[var(--text-muted)] text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-[var(--text-primary)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors">
                          {m.title}
                        </div>
                        {m.description && (
                          <div className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                            {m.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700 border border-purple-500/30 light:border-purple-200">
                          {m.type || "PDF"}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 hidden sm:table-cell font-mono text-xs text-[var(--text-secondary)]">
                        {m.section?.title || "-"}
                      </td>
                      <td className="py-3 px-3.5 text-center hidden md:table-cell font-mono text-xs text-[var(--text-muted)]">
                        {m.fileSize || "-"}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(m.fileUrl || m.externalUrl) && (
                            <a
                              href={m.fileUrl || m.externalUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xs hover:opacity-90"
                              title="Unduh File"
                            >
                              <Download size={12} />
                              <span className="hidden sm:inline">Unduh</span>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(m)}
                            className="text-xs text-cyan-400 light:text-blue-600 cursor-pointer"
                          >
                            <Eye size={12} className="mr-1" />
                            <span>Detail</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-card)] text-center space-y-2">
            <BookOpen className="w-8 h-8 text-cyan-400 light:text-blue-600 mx-auto opacity-70" />
            <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              Belum ada berkas materi untuk {activeSubject.name}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
              Dosen pengampu ({activeSubject.lecturerName || "Dosen"}) belum mengunggah modul atau slide kuliah untuk kelas ini.
            </p>
          </div>
        )
      ) : filteredMaterials.length > 0 ? (
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Semua Berkas Materi Kuliah
                </h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-primary)] border border-[var(--border-color)] text-[var(--text-muted)]">
                  {filteredMaterials.length} Berkas
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)]/40">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--surface-primary)] text-[var(--text-secondary)] font-mono uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3.5 w-12 text-center">#</th>
                  <th className="py-3 px-3.5 w-24">Matkul</th>
                  <th className="py-3 px-3.5">Judul Materi</th>
                  <th className="py-3 px-3.5 w-24 text-center">Tipe</th>
                  <th className="py-3 px-3.5 hidden sm:table-cell">Submateri</th>
                  <th className="py-3 px-3.5 w-24 text-center hidden md:table-cell">Ukuran</th>
                  <th className="py-3 px-3.5 w-36 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/70">
                {filteredMaterials.map((m, idx) => (
                  <tr
                    key={m.id}
                    onClick={() => handleOpenDetailModal(m)}
                    className="hover:bg-[var(--primary)]/5 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-3.5 text-center font-mono text-[var(--text-muted)] text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-xs font-bold text-cyan-400 light:text-blue-700">
                      {m.subject?.code}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-[var(--text-primary)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors">
                        {m.title}
                      </div>
                      {m.description && (
                        <div className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                          {m.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700 border border-purple-500/30 light:border-purple-200">
                        {m.type || "PDF"}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 hidden sm:table-cell font-mono text-xs text-[var(--text-secondary)]">
                      {m.section?.title || "-"}
                    </td>
                    <td className="py-3 px-3.5 text-center hidden md:table-cell font-mono text-xs text-[var(--text-muted)]">
                      {m.fileSize || "-"}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(m.fileUrl || m.externalUrl) && (
                          <a
                            href={m.fileUrl || m.externalUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xs hover:opacity-90"
                            title="Unduh File"
                          >
                            <Download size={12} />
                            <span className="hidden sm:inline">Unduh</span>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(m)}
                          className="text-xs text-cyan-400 light:text-blue-600 cursor-pointer"
                        >
                          <Eye size={12} className="mr-1" />
                          <span>Detail</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* ── 5. Material Detail Modal ──────────────────────────────────────── */}
      <MaterialDetail
        material={selectedMaterial}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
