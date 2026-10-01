"use client";

import * as React from "react";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { AchievementShowcase } from "@/components/achievements/achievement-showcase";
import { AchievementCard, AchievementData } from "@/components/achievements/achievement-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FeaturedAchievementsProps {
  achievements: AchievementData[];
  className?: string;
}

export function FeaturedAchievements({
  achievements,
  className,
}: FeaturedAchievementsProps) {
  if (achievements.length === 0) return null;

  const topAchievement = achievements[0];
  const secondaryAchievements = achievements.slice(1, 3);

  return (
    <section className={cn("space-y-5 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              // Hall of Excellence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Prestasi & Kebanggaan Kelas
          </h2>
        </div>

        <Link href="/achievements">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-amber-400 light:text-amber-700 font-semibold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Lihat Semua Prestasi
          </Button>
        </Link>
      </div>

      {/* Featured Editorial Banner */}
      {topAchievement && <AchievementShowcase achievement={topAchievement} />}

      {/* Secondary Editorial Cards */}
      {secondaryAchievements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secondaryAchievements.map((item) => (
            <AchievementCard key={item.id} achievement={item} />
          ))}
        </div>
      )}
    </section>
  );
}
