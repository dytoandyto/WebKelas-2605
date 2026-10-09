"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { AchievementShowcase } from "@/components/achievements/achievement-showcase";
import { AchievementCard, AchievementData } from "@/components/achievements/achievement-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const max = settings?.maxItems ?? 3;
  const displayAchievements = achievements.slice(0, max);
  const topAchievement = displayAchievements[0];
  const secondaryAchievements = displayAchievements.slice(1);
  const title = settings?.title || "Prestasi & Kebanggaan Kelas";
  const description = settings?.description;

  if (achievements.length === 0) {
    return (
      <section className={cn("space-y-4 text-left", className)}>
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

        <div className="max-w-xl mx-auto w-full">
          <Card
            variant="default"
            padding="lg"
            className="text-center border-dashed space-y-3 p-6 sm:p-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 light:bg-amber-50 border border-amber-500/20 light:border-amber-200 flex items-center justify-center mx-auto text-amber-500 light:text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                Belum ada data prestasi yang dibagikan
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                Pencapaian dan prestasi mahasiswa kelas akan dirayakan di sini.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/achievements">
                <Button variant="outline" size="sm" className="text-xs cursor-pointer">
                  Buka Halaman Prestasi
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    );
  }

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
