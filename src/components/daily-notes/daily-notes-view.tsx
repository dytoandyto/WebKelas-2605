"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Search,
  User,
  BookOpen,
  ChevronRight,
  PlusCircle,
  Tag,
  Sparkles,
  GitCommit,
  List as ListIcon,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Toolbar, EmptyState } from "@/components/shared";

interface DailyNoteItem {
  id: string;
  date: string | Date;
  title: string;
  summary?: string | null;
  content: string;
  importantPoints?: string | null;
  nextSteps?: string | null;
  tags?: string | null;
  mood?: string | null;
  createdAt: string | Date;
  subject?: {
    id: string;
    code: string;
    name: string;
  } | null;
  author?: {
    id: string;
    name: string;
  } | null;
}

interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

interface DailyNotesViewProps {
  dailyNotes: DailyNoteItem[];
  subjects: SubjectOption[];
}

export function DailyNotesView({ dailyNotes, subjects }: DailyNotesViewProps) {
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");

  const filtered = useMemo(() => {
    return dailyNotes.filter((n) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchSummary = n.summary?.toLowerCase().includes(q);
        const matchSubject = n.subject?.name.toLowerCase().includes(q) || n.subject?.code.toLowerCase().includes(q);
        const matchTags = n.tags?.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchSubject && !matchTags) return false;
      }
      if (selectedSubject !== "ALL" && n.subject?.id !== selectedSubject) return false;
      return true;
    });
  }, [dailyNotes, search, selectedSubject]);

  // Group by Month & Year for Timeline
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, DailyNoteItem[]> = {};
    filtered.forEach((note) => {
      const d = new Date(note.date);
      const monthYear = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }).toUpperCase();
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(note);
    });
    return groups;
  }, [filtered]);

  const monthKeys = Object.keys(groupedByMonth);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Toolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari catatan kuliah, topik pembelajaran, kata kunci..."
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

            {(selectedSubject !== "ALL" || search) && (
              <button
                onClick={() => {
                  setSelectedSubject("ALL");
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
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "timeline"
                  ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <GitCommit size={14} />
              <span>Timeline</span>
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
        actions={
          <Link
            href="/admin/daily-notes"
            className="btn btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 rounded-xl"
          >
            <PlusCircle size={14} />
            <span>Tulis Catatan</span>
          </Link>
        }
      />

      {/* Empty State */}
      {filtered.length === 0 && (
        <EmptyState
          icon={<FileText size={28} className="text-[var(--primary)] dark:text-cyan-400" />}
          title="Tidak ada catatan harian ditemukan"
          description={
            search || selectedSubject !== "ALL"
              ? "Tidak ada catatan yang sesuai dengan kata kunci atau filter pencarian."
              : "Belum ada catatan kuliah yang dibuat. Mulai dokumentasikan materi harian kelas!"
          }
          action={
            (search || selectedSubject !== "ALL") && (
              <button
                onClick={() => {
                  setSelectedSubject("ALL");
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

      {/* Timeline Mode */}
      {viewMode === "timeline" && monthKeys.length > 0 && (
        <div className="space-y-8">
          {monthKeys.map((month) => {
            const entries = groupedByMonth[month];
            return (
              <div key={month} className="space-y-4">
                {/* Month Horizon Header */}
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] dark:text-cyan-300 font-mono text-xs font-bold border border-[var(--primary)]/20">
                    {month}
                  </span>
                  <div className="flex-1 h-px bg-[var(--border-color)]/60" />
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {entries.length} Catatan
                  </span>
                </div>

                {/* Vertical Timeline Items */}
                <div className="relative pl-6 sm:pl-8 border-l-2 border-[var(--border-color)] space-y-5 ml-3 sm:ml-4">
                  {entries.map((note) => {
                    const noteDate = new Date(note.date);
                    const dayNumber = noteDate.getDate();
                    const dayName = noteDate.toLocaleDateString("id-ID", { weekday: "short" });

                    return (
                      <div key={note.id} className="relative group">
                        {/* Timeline Node Point */}
                        <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--primary)] shadow-sm group-hover:scale-125 transition-transform" />

                        {/* Note Card */}
                        <div className="card p-5 bg-[var(--bg-surface)] hover:border-[var(--primary)] transition-all space-y-3 shadow-sm hover:shadow-md">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 font-mono text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                                <span>{dayNumber}</span>
                                <span className="uppercase text-[10px]">{dayName}</span>
                              </div>
                              {note.subject && (
                                <span className="px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] dark:text-cyan-300 text-xs font-mono font-semibold border border-[var(--primary)]/20">
                                  {note.subject.code}
                                </span>
                              )}
                            </div>

                            {note.mood && (
                              <span className="text-xs text-[var(--text-muted)]">
                                Suasana: {note.mood}
                              </span>
                            )}
                          </div>

                          <div>
                            <Link href={`/daily-notes/${note.id}`}>
                              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors leading-snug">
                                {note.title}
                              </h3>
                            </Link>

                            {note.subject && (
                              <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                                {note.subject.name}
                              </p>
                            )}
                          </div>

                          {note.summary && (
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                              {note.summary}
                            </p>
                          )}

                          {note.tags && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {note.tags.split(",").map((t) => (
                                <span
                                  key={t.trim()}
                                  className="px-2 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-muted)] text-[10px] font-mono"
                                >
                                  #{t.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="pt-3 border-t border-[var(--border-color)]/50 flex items-center justify-between text-xs text-[var(--text-muted)]">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <User size={12} className="text-[var(--primary)]" />
                              <span>{note.author?.name || "Mahasiswa"}</span>
                            </span>

                            <Link
                              href={`/daily-notes/${note.id}`}
                              className="text-xs font-bold text-[var(--primary)] dark:text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              <span>Baca Catatan</span>
                              <ChevronRight size={13} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  <th className="p-3.5">TANGGAL</th>
                  <th className="p-3.5">JUDUL & RANGKUMAN</th>
                  <th className="p-3.5">MATA KULIAH</th>
                  <th className="p-3.5">PENULIS</th>
                  <th className="p-3.5 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {filtered.map((note) => (
                  <tr key={note.id} className="hover:bg-[var(--bg-muted)]/50 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(note.date, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="p-3.5 max-w-md">
                      <Link
                        href={`/daily-notes/${note.id}`}
                        className="font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors block line-clamp-1"
                      >
                        {note.title}
                      </Link>
                      {note.summary && (
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                          {note.summary}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 font-mono">
                      {note.subject ? (
                        <span className="text-[var(--primary)] dark:text-cyan-400 font-semibold">
                          {note.subject.code}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)]">
                      {note.author?.name || "-"}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/daily-notes/${note.id}`}
                        className="btn btn-secondary px-3 py-1 text-xs inline-flex items-center gap-1"
                      >
                        <span>Baca</span>
                        <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
