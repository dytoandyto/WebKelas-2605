"use client";

import * as React from "react";
import { Trophy, Calendar } from "lucide-react";
import { AchievementData, AchievementCard } from "./achievement-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface AchievementTimelineProps {
  achievements: AchievementData[];
  onAchievementClick?: (achievement: AchievementData) => void;
  className?: string;
}

export function AchievementTimeline({
  achievements,
  onAchievementClick,
  className,
}: AchievementTimelineProps) {
  if (achievements.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="w-6 h-6 text-amber-400" />}
        title="Belum Ada Prestasi"
        description="Belum ada rekam jejak prestasi yang dicatat dalam kategori ini."
        className={className}
      />
    );
  }

  // Sort descending
  const sorted = [...achievements].sort(
    (a, b) =>
      new Date(b.achievementDate).getTime() -
      new Date(a.achievementDate).getTime()
  );

  return (
    <div className={cn("relative pl-6 sm:pl-8 space-y-6 text-left", className)}>
      {/* Golden / Cyan vertical guide line */}
      <div className="absolute top-3 bottom-3 left-2.5 sm:left-3.5 w-0.5 bg-gradient-to-b from-amber-400 via-cyan-400 to-transparent" />

      {sorted.map((item) => (
        <div key={item.id} className="relative group">
          {/* Node */}
          <div className="absolute -left-6 sm:-left-8 top-5 w-5 h-5 rounded-full bg-[var(--surface-primary)] border-2 border-amber-400 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)] group-hover:scale-125 transition-transform light:bg-white light:border-amber-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>

          <AchievementCard
            achievement={item}
            onClick={() => onAchievementClick?.(item)}
          />
        </div>
      ))}
    </div>
  );
}
