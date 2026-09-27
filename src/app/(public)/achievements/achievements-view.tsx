"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Search,
  Calendar,
  Building,
  MapPin,
  Users,
  Award,
  Sparkles,
  Grid as GridIcon,
  GitCommit,
  Star,
  ExternalLink,
} from "lucide-react";
import { AchievementCategory } from "@prisma/client";
import { formatDate, cn } from "@/lib/utils";

interface StudentItem {
  id: string;
  name: string;
  photoUrl?: string | null;
  major: string;
}

interface AchievementItem {
  id: string;
  title: string;
  description?: string | null;
  category: AchievementCategory;
  achievementDate: Date | string;
  organization?: string | null;
  location?: string | null;
  badgeIconUrl?: string | null;
  imageUrl?: string | null;
  students?: { student: StudentItem }[];
}

interface AchievementsViewProps {
  initialAchievements: AchievementItem[];
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  COMPETITION: "Kompetisi",
  VOLUNTEER: "Sosial & Volunteer",
  ORGANIZATION: "Organisasi",
  ACADEMIC: "Akademik",
  CREATIVE: "Kreatif & Desain",
  TECHNOLOGY: "Teknologi",
  OTHER: "Lainnya",
};

export function AchievementsView({ initialAchievements }: AchievementsViewProps) {
  const [viewMode, setViewMode] = useState<"showcase" | "grid" | "timeline">("showcase");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = Object.keys(AchievementCategory) as AchievementCategory[];

  const filtered = useMemo(() => {
    return initialAchievements.filter((ach) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        ach.title.toLowerCase().includes(q) ||
        (ach.description && ach.description.toLowerCase().includes(q)) ||
        (ach.organization && ach.organization.toLowerCase().includes(q)) ||
        (ach.students &&
          ach.students.some((s) => s.student?.name.toLowerCase().includes(q)));

      if (!matchesSearch) return false;
      if (selectedCategory !== "ALL" && ach.category !== selectedCategory) return false;
      return true;
    });
  }, [initialAchievements, searchQuery, selectedCategory]);

  // Featured achievement for showcase mode (the first one)
  const featured = filtered[0];
  const remaining = filtered.slice(1);

  // Grouped by year for timeline mode
  const timelineGroups = useMemo(() => {
    const groups: Record<string, AchievementItem[]> = {};
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime()
    );
    sorted.forEach((item) => {
      const year = new Date(item.achievementDate).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="card p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Cari prestasi, penyelenggara, atau nama peraih..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl"
          />
        </div>

        {/* View Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] self-start sm:self-auto">
          <button
            onClick={() => setViewMode("showcase")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "showcase"
                ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Star size={14} />
            <span>Showcase</span>
          </button>
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
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === "ALL"
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
          }`}
        >
          Semua Kategori ({initialAchievements.length})
        </button>
        {categories.map((cat) => {
          const count = initialAchievements.filter((a) => a.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
              }`}
            >
              {CATEGORY_LABELS[cat] || cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="card p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-500">
            <Trophy size={26} />
          </div>
          <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">Prestasi Tidak Ditemukan</h3>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
            {searchQuery
              ? `Tidak ada prestasi yang cocok dengan kata kunci "${searchQuery}".`
              : "Belum ada prestasi yang tercatat dalam kategori ini."}
          </p>
        </div>
      )}

      {/* 1. SHOWCASE MODE */}
      {viewMode === "showcase" && filtered.length > 0 && (
        <div className="space-y-6">
          {/* Featured Large Hero Card */}
          {featured && (
            <div className="card card-feature p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>PRESTASI UNGGULAN &bull; {CATEGORY_LABELS[featured.category]}</span>
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {formatDate(featured.achievementDate)}
                </span>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1 space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-black font-display text-[var(--text-primary)] leading-tight">
                    {featured.title}
                  </h3>
                  {featured.organization && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--primary)] dark:text-cyan-400 font-medium">
                      <Building size={14} />
                      <span>Diselenggarakan oleh: {featured.organization}</span>
                      {featured.location && <span>({featured.location})</span>}
                    </div>
                  )}
                  {featured.description && (
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {featured.description}
                    </p>
                  )}

                  {/* Honored Students */}
                  {featured.students && featured.students.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-mono text-[var(--text-muted)] font-bold block mb-1.5 uppercase">
                        Peraih Penghargaan:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {featured.students.map(({ student }) => (
                          <Link
                            key={student.id}
                            href={`/students/${student.id}`}
                            className="inline-flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[var(--bg-muted)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors text-xs"
                          >
                            <div className="w-5 h-5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-bold flex items-center justify-center text-[10px]">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-[var(--text-primary)]">{student.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {featured.imageUrl && (
                  <div className="w-full lg:w-80 h-48 rounded-2xl overflow-hidden border border-[var(--border-color)] shrink-0">
                    <img src={featured.imageUrl} alt={featured.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remaining Grid */}
          {remaining.length > 0 && (
            <div className="space-y-3 pt-4">
              <h4 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-muted)]">
                Prestasi Lainnya ({remaining.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {remaining.map((ach) => (
                  <AchievementCard key={ach.id} ach={ach} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. GRID MODE */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ach) => (
            <AchievementCard key={ach.id} ach={ach} />
          ))}
        </div>
      )}

      {/* 3. TIMELINE MODE */}
      {viewMode === "timeline" && filtered.length > 0 && (
        <div className="space-y-8">
          {Object.keys(timelineGroups).map((year) => {
            const yearItems = timelineGroups[year];
            return (
              <div key={year} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] dark:text-cyan-300 font-mono text-xs font-bold border border-[var(--primary)]/20">
                    Tahun {year}
                  </span>
                  <div className="flex-1 h-px bg-[var(--border-color)]/60" />
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {yearItems.length} Penghargaan
                  </span>
                </div>

                <div className="relative pl-6 sm:pl-8 border-l-2 border-[var(--border-color)] space-y-4 ml-3 sm:ml-4">
                  {yearItems.map((ach) => (
                    <div key={ach.id} className="relative group">
                      <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-[var(--bg-surface)] border-2 border-amber-500 shadow-sm" />
                      <AchievementCard ach={ach} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AchievementCard({ ach }: { ach: AchievementItem }) {
  return (
    <div className="card p-5 bg-[var(--bg-surface)] hover:border-[var(--primary)] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30">
            {CATEGORY_LABELS[ach.category]}
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {formatDate(ach.achievementDate, { month: "short", year: "numeric" })}
          </span>
        </div>

        <div>
          <h4 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors leading-snug">
            {ach.title}
          </h4>
          {ach.organization && (
            <p className="text-xs text-[var(--primary)] dark:text-cyan-400 font-medium mt-0.5">
              {ach.organization}
            </p>
          )}
        </div>

        {ach.description && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {ach.description}
          </p>
        )}

        {/* Recipients */}
        {ach.students && ach.students.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {ach.students.map(({ student }) => (
              <span
                key={student.id}
                className="px-2 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-secondary)] text-[10px] font-mono"
              >
                {student.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[var(--border-color)]/60 mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1 text-[11px]">
          <Award size={12} className="text-amber-500" />
          <span>JS1SI-26-REG-05</span>
        </span>
      </div>
    </div>
  );
}
