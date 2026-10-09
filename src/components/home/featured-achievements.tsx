"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AchievementShowcase } from "@/components/achievements/achievement-showcase";
import { AchievementCard, AchievementData } from "@/components/achievements/achievement-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AchievementsSettings } from "@/lib/homepage/types";

export interface FeaturedAchievementsProps {
  achievements: AchievementData[];
  settings?: AchievementsSettings;
  className?: string;
}

export function FeaturedAchievements({
  achievements,
  settings,
  className,
}: FeaturedAchievementsProps) {
  if (achievements.length === 0) return null;

  const max = settings?.maxItems ?? 3;
  const displayAchievements = achievements.slice(0, max);
  const topAchievement = displayAchievements[0];
  const secondaryAchievements = displayAchievements.slice(1);
  const title = settings?.title || "Prestasi & Kebanggaan Kelas";
  const description = settings?.description;

  return (
    <section className={cn("space-y-5 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              {"// Prestasi"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
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
