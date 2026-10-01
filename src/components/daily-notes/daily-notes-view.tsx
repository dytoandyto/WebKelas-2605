"use client";

import React, { useState, useMemo } from "react";
import { Search, GitCommit, List as ListIcon, Calendar, BookOpen } from "lucide-react";
import {
  DailyNoteData,
  DailyNoteCard,
  DailyNoteTimeline,
  DailyNoteContent,
} from "./index";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

interface DailyNotesViewProps {
  dailyNotes: DailyNoteData[];
  subjects: SubjectOption[];
}

export function DailyNotesView({ dailyNotes, subjects }: DailyNotesViewProps) {
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedNote, setSelectedNote] = useState<DailyNoteData | null>(null);
  const [contentOpen, setContentOpen] = useState(false);

  const filtered = useMemo(() => {
    return dailyNotes.filter((n) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchSummary = n.summary?.toLowerCase().includes(q);
        const matchSubject =
          n.subject?.name?.toLowerCase().includes(q) ||
          n.subject?.code?.toLowerCase().includes(q);
        const matchTags = n.tags?.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchSubject && !matchTags)
          return false;
      }
      if (selectedSubject !== "ALL" && (n.subject as any)?.id !== selectedSubject)
        return false;
      return true;
    });
  }, [dailyNotes, search, selectedSubject]);

  const handleNoteClick = (note: DailyNoteData) => {
    setSelectedNote(note);
    setContentOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cari catatan kuliah, topik pembelajaran, kata kunci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Subject Filter */}
          <div className="w-48">
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

          {/* View Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] light:bg-slate-100">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                viewMode === "timeline"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <GitCommit size={14} />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <ListIcon size={14} />
              <span className="hidden sm:inline">Grid Kartu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-cyan-400" />}
          title="Tidak Ada Catatan Kuliah Ditemukan"
          description="Tidak ada catatan jurnal perkuliahan yang cocok dengan kriteria pencarian."
        />
      ) : viewMode === "timeline" ? (
        <DailyNoteTimeline notes={filtered} onNoteClick={handleNoteClick} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((note) => (
            <DailyNoteCard
              key={note.id}
              note={note}
              onClick={() => handleNoteClick(note)}
            />
          ))}
        </div>
      )}

      {/* Long-Form Reading Modal */}
      {selectedNote && (
        <Dialog open={contentOpen} onOpenChange={setContentOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DailyNoteContent note={selectedNote} />
            <DialogFooter>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setContentOpen(false)}
              >
                Tutup Catatan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
