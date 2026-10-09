"use client";

import * as React from "react";
import Image from "next/image";
import { Trophy, Calendar, Building, Users, Sparkles, ArrowRight } from "lucide-react";
import { AchievementData, getAchievementBadge } from "./achievement-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";

export interface AchievementShowcaseProps {
  achievement: AchievementData;
  onClick?: () => void;
  className?: string;
}

export function AchievementShowcase({
  achievement,
  onClick,
  className,
}: AchievementShowcaseProps) {
  const students = achievement.students || [];

  return (
    <Card
      variant="featured"
      padding="none"
      onClick={onClick}
      className={cn(
        "grid grid-cols-1 lg:grid-cols-12 overflow-hidden text-left cursor-pointer group",
        className
      )}
    >
      {/* Visual / Media Side (5 cols) */}
      <div className="relative min-h-[260px] lg:min-h-full lg:col-span-5 bg-gradient-to-tr from-cyan-950 to-blue-900/40 p-6 flex flex-col justify-between overflow-hidden">
        {achievement.imageUrl ? (
          <Image
            src={achievement.imageUrl}
            alt={achievement.title}
            fill
            sizes="(max-width: 1024px) 100vw, 500px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500/10 via-cyan-500/10 to-blue-600/15 light:from-amber-50 light:via-blue-50/60 light:to-sky-50">
            <div className="absolute inset-0 cyber-grid opacity-25 light:opacity-10" />
            <div className="relative z-0 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/15 light:bg-amber-100/90 border border-amber-400/30 light:border-amber-300 flex items-center justify-center text-amber-400 light:text-amber-600 shadow-[0_0_24px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300/80 light:text-amber-700 font-bold">
                Rekam Prestasi
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060b17]/90 via-[#060b17]/40 to-transparent light:from-white/90" />

        {/* Featured Pill */}
        <div className="relative z-10 self-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sorotan Prestasi</span>
          </div>
        </div>

        <div className="relative z-10 space-y-1">
          <div className="text-xs font-mono text-cyan-300 light:text-blue-700 font-bold">
            {achievement.organization || "Telkom University Jakarta"}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {formatDate(achievement.achievementDate)}
          </div>
        </div>
      </div>

      {/* Content Side (7 cols) */}
      <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getAchievementBadge(achievement.category)}
            {achievement.location && (
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {achievement.location}
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-snug group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors">
            {achievement.title}
          </h3>

          {achievement.description && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
              {achievement.description}
            </p>
          )}
        </div>

        {/* Participants & Action */}
        <div className="pt-4 border-t border-[var(--border-color)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {students.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] block font-mono">
                  Mahasiswa Berprestasi:
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {students.map((s) => s.student.name).join(", ")}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 font-semibold text-cyan-400 light:text-blue-600 group-hover:translate-x-1 transition-transform shrink-0">
            <span>Lihat Detail Rekam Prestasi</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Card>
  );
}
