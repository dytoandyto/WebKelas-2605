"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Download,
  ExternalLink,
  Calendar,
  FileText,
  Video,
  FileSpreadsheet,
  FileCode,
  Layers,
  ChevronRight,
  Tag,
  Grid as GridIcon,
  List as ListIcon,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MaterialType } from "@prisma/client";
import { Toolbar, EmptyState } from "@/components/shared";

interface MaterialItem {
  id: string;
  title: string;
  description?: string | null;
  type: MaterialType;
  fileUrl?: string | null;
  externalUrl?: string | null;
  fileName?: string | null;
  fileSize?: string | null;
  tags?: string | null;
  createdAt: string | Date;
  subject?: {
    id: string;
    code: string;
    name: string;
  } | null;
  uploader?: {
    id: string;
    name: string;
  } | null;
}

interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

interface MaterialsViewProps {
  materials: MaterialItem[];
  subjects: SubjectOption[];
}

const TYPE_BADGES: Record<MaterialType, { bg: string; text: string; border: string }> = {
  PDF: { bg: "bg-rose-500/15", text: "text-rose-400 dark:text-rose-300", border: "border-rose-500/30" },
  PPT: { bg: "bg-amber-500/15", text: "text-amber-500 dark:text-amber-300", border: "border-amber-500/30" },
  DOC: { bg: "bg-blue-500/15", text: "text-blue-500 dark:text-blue-300", border: "border-blue-500/30" },
  XLS: { bg: "bg-emerald-500/15", text: "text-emerald-500 dark:text-emerald-300", border: "border-emerald-500/30" },
  LINK: { bg: "bg-cyan-500/15", text: "text-cyan-500 dark:text-cyan-300", border: "border-cyan-500/30" },
  VIDEO: { bg: "bg-purple-500/15", text: "text-purple-500 dark:text-purple-300", border: "border-purple-500/30" },
  IMAGE: { bg: "bg-teal-500/15", text: "text-teal-500 dark:text-teal-300", border: "border-teal-500/30" },
  OTHER: { bg: "bg-slate-500/15", text: "text-slate-500 dark:text-slate-300", border: "border-slate-500/30" },
};

export function MaterialsView({ materials, subjects }: MaterialsViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchDesc = m.description?.toLowerCase().includes(q);
        const matchSubject = m.subject?.name.toLowerCase().includes(q) || m.subject?.code.toLowerCase().includes(q);
        const matchTags = m.tags?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSubject && !matchTags) return false;
      }
      if (selectedSubject !== "ALL" && m.subject?.id !== selectedSubject) return false;
      if (selectedType !== "ALL" && m.type !== selectedType) return false;
      return true;
    });
  }, [materials, search, selectedSubject, selectedType]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Toolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari materi kuliah, modul, tag..."
        filters={
          <>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label="Filter Mata Kuliah"
              className="input text-xs py-2 px-3 rounded-xl max-w-[170px]"
            >
              <option value="ALL">Semua Mata Kuliah</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter Format Berkas"
              className="input text-xs py-2 px-3 rounded-xl"
            >
              <option value="ALL">Semua Format</option>
              {Object.keys(TYPE_BADGES).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {(selectedSubject !== "ALL" || selectedType !== "ALL" || search) && (
              <button
                onClick={() => {
                  setSelectedSubject("ALL");
                  setSelectedType("ALL");
                  setSearch("");
                }}
                className="btn btn-ghost text-xs px-2.5 py-1.5 text-[var(--text-muted)] hover:text-rose-400"
              >
                Reset
              </button>
            )}
          </>
        }
        viewSwitcher={
          <div className="inline-flex items-center p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <GridIcon size={14} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "list"
                  ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <ListIcon size={14} />
              <span>List</span>
            </button>
          </div>
        }
      />

      {/* Empty State */}
      {filtered.length === 0 && (
        <EmptyState
          icon={<BookOpen size={28} className="text-[var(--primary)] dark:text-cyan-400" />}
          title="Tidak ada materi ditemukan"
          description={
            search || selectedSubject !== "ALL" || selectedType !== "ALL"
              ? "Tidak ada materi yang sesuai dengan kata kunci atau filter pencarian."
              : "Belum ada materi pembelajaran yang diunggah ke dalam repositori kelas."
          }
          action={
            (search || selectedSubject !== "ALL" || selectedType !== "ALL") && (
              <button
                onClick={() => {
                  setSelectedSubject("ALL");
                  setSelectedType("ALL");
                  setSearch("");
                }}
                className="btn btn-secondary text-xs px-4 py-2"
              >
                Reset Filter
              </button>
            )
          }
        />
      )}

      {/* Grid Mode */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((mat) => {
            const badge = TYPE_BADGES[mat.type] || TYPE_BADGES.OTHER;
            return (
              <div
                key={mat.id}
                className="card p-5 bg-[var(--bg-surface)] hover:border-[var(--primary)] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {mat.type}
                    </span>
                    {mat.subject && (
                      <Link
                        href={`/subjects/${mat.subject.code}`}
                        className="px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] dark:text-cyan-300 font-mono text-[11px] font-bold border border-[var(--primary)]/20 hover:underline"
                      >
                        {mat.subject.code}
                      </Link>
                    )}
                  </div>

                  <div>
                    <Link href={`/materials/${mat.id}`}>
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors leading-snug">
                        {mat.title}
                      </h3>
                    </Link>
                    {mat.subject && (
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                        {mat.subject.name}
                      </p>
                    )}
                  </div>

                  {mat.description && (
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {mat.description}
                    </p>
                  )}

                  {mat.tags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {mat.tags.split(",").map((t) => (
                        <span
                          key={t.trim()}
                          className="px-2 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-muted)] text-[10px] font-mono"
                        >
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3.5 border-t border-[var(--border-color)]/60 mt-4 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-[var(--text-muted)] font-mono block">
                      {formatDate(mat.createdAt)}
                    </span>
                    {mat.fileSize && (
                      <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                        Ukuran: {mat.fileSize}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mat.fileUrl ? (
                      <a
                        href={mat.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
                      >
                        <Download size={13} />
                        <span>Unduh</span>
                      </a>
                    ) : mat.externalUrl ? (
                      <a
                        href={mat.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
                      >
                        <ExternalLink size={13} />
                        <span>Buka</span>
                      </a>
                    ) : (
                      <Link
                        href={`/materials/${mat.id}`}
                        className="btn btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
                      >
                        <span>Lihat</span>
                        <ChevronRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Mode */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full text-left text-xs">
              <thead className="bg-[var(--bg-muted)] text-[var(--text-muted)] font-mono border-b border-[var(--border-color)]">
                <tr>
                  <th className="p-3.5">MATERI</th>
                  <th className="p-3.5">MATA KULIAH</th>
                  <th className="p-3.5">TIPE</th>
                  <th className="p-3.5">UKURAN</th>
                  <th className="p-3.5">TANGGAL</th>
                  <th className="p-3.5 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {filtered.map((mat) => {
                  const badge = TYPE_BADGES[mat.type] || TYPE_BADGES.OTHER;
                  return (
                    <tr key={mat.id} className="hover:bg-[var(--bg-muted)]/50 transition-colors">
                      <td className="p-3.5 max-w-sm">
                        <Link
                          href={`/materials/${mat.id}`}
                          className="font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors block line-clamp-1"
                        >
                          {mat.title}
                        </Link>
                        {mat.description && (
                          <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                            {mat.description}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5 font-mono">
                        {mat.subject ? (
                          <span className="text-[var(--primary)] dark:text-cyan-400 font-semibold">
                            {mat.subject.code}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">Umum</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {mat.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[var(--text-muted)]">
                        {mat.fileSize || "-"}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[var(--text-muted)]">
                        {formatDate(mat.createdAt, { month: "short", day: "numeric" })}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/materials/${mat.id}`}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
                          >
                            <ChevronRight size={15} />
                          </Link>
                          {mat.fileUrl && (
                            <a
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary px-2.5 py-1 text-[11px] flex items-center gap-1"
                            >
                              <Download size={12} />
                              <span>Unduh</span>
                            </a>
                          )}
                          {mat.externalUrl && (
                            <a
                              href={mat.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary px-2.5 py-1 text-[11px] flex items-center gap-1"
                            >
                              <ExternalLink size={12} />
                              <span>Buka</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
