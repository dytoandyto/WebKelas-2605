"use client";

import React, { useState, useMemo } from "react";
import { Search, Grid as GridIcon, List as ListIcon, BookOpen } from "lucide-react";
import { MaterialType } from "@prisma/client";
import {
  MaterialData,
  MaterialCard,
  MaterialList,
  MaterialDetail,
} from "./index";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

interface MaterialsViewProps {
  materials: MaterialData[];
  subjects: SubjectOption[];
}

export function MaterialsView({ materials, subjects }: MaterialsViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchDesc = m.description?.toLowerCase().includes(q);
        const matchSubject =
          m.subject?.name.toLowerCase().includes(q) ||
          m.subject?.code.toLowerCase().includes(q);
        const matchTags = m.tags?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSubject && !matchTags) return false;
      }
      if (selectedSubject !== "ALL" && m.subject?.id !== selectedSubject)
        return false;
      if (selectedType !== "ALL" && m.type !== selectedType) return false;
      return true;
    });
  }, [materials, search, selectedSubject, selectedType]);

  const handleMaterialClick = (m: MaterialData) => {
    setSelectedMaterial(m);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cari materi kuliah, modul, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Subject Filter */}
          <div className="w-44">
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="ALL">Semua Mata Kuliah</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Type Filter */}
          <div className="w-36">
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">Semua Format</option>
              <option value="PDF">PDF</option>
              <option value="SLIDE">Slide Presentasi</option>
              <option value="DOCUMENT">Dokumen</option>
              <option value="VIDEO">Video</option>
              <option value="CODE">Kode / Zip</option>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] light:bg-slate-100">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              title="Grid View"
            >
              <GridIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-cyan-400" />}
          title="Tidak Ada Materi Ditemukan"
          description="Tidak ada dokumen atau referensi yang cocok dengan filter pencarian."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onClick={() => handleMaterialClick(material)}
            />
          ))}
        </div>
      ) : (
        <MaterialList
          materials={filtered}
          onMaterialClick={handleMaterialClick}
        />
      )}

      {/* Detail Dialog */}
      <MaterialDetail
        material={selectedMaterial}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
