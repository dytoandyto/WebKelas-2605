"use client";

import React, { useState } from "react";
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
  COMPETITION: "Competition",
  VOLUNTEER: "Volunteer",
  ORGANIZATION: "Organization",
  ACADEMIC: "Academic",
  CREATIVE: "Creative",
  TECHNOLOGY: "Technology",
  OTHER: "Other",
};

const CATEGORY_STYLES: Record<
  AchievementCategory,
  { badge: string; border: string; glow: string; iconBg: string }
> = {
  COMPETITION: {
    badge: "badge-amber",
    border: "hover:border-amber-400/50",
    glow: "bg-amber-500/10",
    iconBg: "bg-amber-950/60 border-amber-500/30 text-amber-400",
  },
  VOLUNTEER: {
    badge: "badge-teal",
    border: "hover:border-teal-400/50",
    glow: "bg-teal-500/10",
    iconBg: "bg-teal-950/60 border-teal-500/30 text-teal-400",
  },
  ORGANIZATION: {
    badge: "badge-purple",
    border: "hover:border-purple-400/50",
    glow: "bg-purple-500/10",
    iconBg: "bg-purple-950/60 border-purple-500/30 text-purple-400",
  },
  ACADEMIC: {
    badge: "badge-blue",
    border: "hover:border-cyan-400/50",
    glow: "bg-cyan-500/10",
    iconBg: "bg-cyan-950/60 border-cyan-500/30 text-cyan-400",
  },
  CREATIVE: {
    badge: "badge-green",
    border: "hover:border-emerald-400/50",
    glow: "bg-emerald-500/10",
    iconBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-400",
  },
  TECHNOLOGY: {
    badge: "badge-blue",
    border: "hover:border-blue-400/50",
    glow: "bg-blue-500/10",
    iconBg: "bg-blue-950/60 border-blue-500/30 text-blue-400",
  },
  OTHER: {
    badge: "badge-gray",
    border: "hover:border-slate-500/50",
    glow: "bg-slate-500/10",
    iconBg: "bg-[#061021] border-cyan-500/20 text-slate-300",
  },
};

export function AchievementsView({ initialAchievements }: AchievementsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = Object.keys(AchievementCategory) as AchievementCategory[];

  const filtered = initialAchievements.filter((ach) => {
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

  return (
    <div className="space-y-8">
      {/* Search & Category Pills */}
      <div className="cyber-card p-5 rounded-2xl bg-[#0a1a2f]/70 border border-cyan-500/20 backdrop-blur-xl space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            placeholder="Search by achievement, awarder, or student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#061021]/90 border border-cyan-500/25 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
          />
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              selectedCategory === "ALL"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-glow border border-cyan-300/40"
                : "bg-[#061021] text-slate-300 hover:text-white hover:border-cyan-400/40 border border-cyan-500/15"
            )}
          >
            All Categories ({initialAchievements.length})
          </button>
          {categories.map((cat) => {
            const count = initialAchievements.filter((a) => a.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-glow border border-cyan-300/40"
                    : "bg-[#061021] text-slate-300 hover:text-white hover:border-cyan-400/40 border border-cyan-500/15"
                )}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements Cards */}
      {filtered.length === 0 ? (
        <div className="cyber-card p-12 text-center rounded-2xl bg-[#0a1a2f]/60 border border-cyan-500/20">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Trophy size={26} />
          </div>
          <h3 className="font-bold text-white text-lg mb-1">No achievements found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {searchQuery
              ? `No honors match "${searchQuery}". Try a different keyword.`
              : "No awards found in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ach) => {
            const style = CATEGORY_STYLES[ach.category] || CATEGORY_STYLES.OTHER;
            return (
              <div
                key={ach.id}
                className={cn(
                  "cyber-card rounded-2xl overflow-hidden flex flex-col justify-between border border-cyan-500/20 bg-[#0a1a2f]/75 hover:shadow-cyan-glow transition-all duration-300 hover:-translate-y-1",
                  style.border
                )}
              >
                {/* Optional Top Image */}
                {ach.imageUrl && (
                  <div className="h-44 w-full bg-[#061021] overflow-hidden relative">
                    <img
                      src={ach.imageUrl}
                      alt={ach.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={cn("badge text-xs font-semibold backdrop-blur-md shadow-sm", style.badge)}>
                        {CATEGORY_LABELS[ach.category]}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  {/* Category & Badge Icon Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-2xl border flex items-center justify-center text-lg flex-shrink-0 shadow-xs",
                          style.iconBg
                        )}
                      >
                        {ach.badgeIconUrl ? ach.badgeIconUrl : <Trophy size={20} />}
                      </div>
                      {!ach.imageUrl && (
                        <span className={cn("badge text-xs font-semibold", style.badge)}>
                          {CATEGORY_LABELS[ach.category]}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatDate(ach.achievementDate)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-white text-base leading-snug mb-2 line-clamp-2">
                    {ach.title}
                  </h3>

                  {ach.organization && (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium mb-3">
                      <Building size={13} className="text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{ach.organization}</span>
                      {ach.location && (
                        <>
                          <span className="text-slate-500">&bull;</span>
                          <span className="text-slate-400 truncate">{ach.location}</span>
                        </>
                      )}
                    </div>
                  )}

                  {ach.description && (
                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                      {ach.description}
                    </p>
                  )}

                  {/* Students Tagged Section */}
                  {ach.students && ach.students.length > 0 && (
                    <div className="mt-auto pt-3 border-t border-cyan-500/15">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Awarded to:
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {ach.students.map((sa: any) => {
                          const stu = sa.student;
                          if (!stu) return null;
                          return (
                            <Link
                              key={stu.id}
                              href={`/students/${stu.id}`}
                              className="inline-flex items-center gap-1.5 bg-[#061021] hover:bg-cyan-950/80 border border-cyan-500/20 hover:border-cyan-400/50 rounded-full px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors"
                            >
                              <div className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-extrabold text-[9px]">
                                {stu.name.charAt(0)}
                              </div>
                              <span className="font-medium truncate max-w-[130px]">{stu.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
