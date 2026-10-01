"use client";

import React, { useState, useMemo } from "react";
import { Search, Sparkles, Grid as GridIcon, GitCommit, Trophy } from "lucide-react";
import { AchievementCategory } from "@prisma/client";
import {
  AchievementData,
  AchievementCard,
  AchievementShowcase,
  AchievementTimeline,
  AchievementDetail,
} from "@/components/achievements";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface AchievementsViewProps {
  initialAchievements: AchievementData[];
}

export function AchievementsView({ initialAchievements }: AchievementsViewProps) {
  const [viewMode, setViewMode] = useState<"showcase" | "grid" | "timeline">("showcase");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const categories = Object.keys(AchievementCategory) as AchievementCategory[];

  const filtered = useMemo(() => {
    return initialAchievements.filter((ach) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
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

  const featured = filtered[0];
  const remaining = filtered.slice(1);

  const handleAchievementClick = (item: AchievementData) => {
    setSelectedAchievement(item);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cari prestasi, penyelenggara, atau nama peraih..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Category Filter */}
          <div className="w-44">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          {/* View Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] light:bg-slate-100">
            <button
              type="button"
              onClick={() => setViewMode("showcase")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                viewMode === "showcase"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Sorotan</span>
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
              <GridIcon size={14} />
              <span className="hidden sm:inline">Grid</span>
            </button>
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
          </div>
        </div>
      </div>

      {/* Main Display Area */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8 text-amber-400" />}
          title="Tidak Ada Prestasi Ditemukan"
          description="Tidak ada rekam prestasi yang sesuai dengan kriteria pencarian saat ini."
        />
      ) : viewMode === "showcase" ? (
        <div className="space-y-6">
          {featured && (
            <AchievementShowcase
              achievement={featured}
              onClick={() => handleAchievementClick(featured)}
            />
          )}
          {remaining.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {remaining.map((item) => (
                <AchievementCard
                  key={item.id}
                  achievement={item}
                  onClick={() => handleAchievementClick(item)}
                />
              ))}
            </div>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <AchievementCard
              key={item.id}
              achievement={item}
              onClick={() => handleAchievementClick(item)}
            />
          ))}
        </div>
      ) : (
        <AchievementTimeline
          achievements={filtered}
          onAchievementClick={handleAchievementClick}
        />
      )}

      {/* Detail Dialog */}
      <AchievementDetail
        achievement={selectedAchievement}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
