"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AboutSettings } from "@/lib/homepage/types";
import { cn } from "@/lib/utils";

export interface HomeAboutTeaserProps {
  settings?: AboutSettings;
  classCode?: string;
  classNameTitle?: string;
  institutionName?: string;
  waliDosen?: string;
  vision?: string;
  studentsCount?: number;
  achievementsCount?: number;
  className?: string;
}

export function HomeAboutTeaser({
  settings,
  classCode = "JS1SI-26-REG-05",
  classNameTitle = "S1 Sistem Informasi",
  institutionName = "Telkom University Jakarta",
  waliDosen = "Muhammad Ardiansyah",
  vision = "Mewujudkan kelas yang solid, inovatif, dan berdaya saing tinggi di bidang sistem informasi modern.",
  studentsCount = 38,
  achievementsCount = 6,
  className,
}: HomeAboutTeaserProps) {
  const title = settings?.title || "Kenali Lebih Dekat JS1SI-26-REG-05";
  const description =
    settings?.description ||
    "Bukan sekadar ruang kuliah, tapi wadah bertumbuh, berbagi referensi, dan berkolaborasi bersama.";
  const buttonLabel = settings?.buttonText || "Baca Profil Kelas Lengkap";
  const showVision = settings?.showVision ?? true;
  const showStats = true;

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-blue-400 font-bold">
              {"// Tentang Kelas"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        </div>

        <Link href="/about">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {buttonLabel}
          </Button>
        </Link>
      </div>

      <Card
        variant="interactive"
        padding="lg"
        className="relative overflow-hidden border border-[var(--border-color)] bg-[var(--surface-card)] p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-300 font-semibold">
                {classCode}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[var(--text-secondary)]">
                {classNameTitle}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[var(--text-secondary)]">
                {institutionName}
              </span>
            </div>

            {showVision && (
              <blockquote className="border-l-2 border-blue-600 dark:border-blue-400 pl-4 py-1 italic text-sm sm:text-base text-[var(--text-primary)] font-medium leading-relaxed">
                &ldquo;{vision}&rdquo;
              </blockquote>
            )}

            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Dibimbing oleh Wali Dosen{" "}
              <strong className="text-[var(--text-primary)] font-semibold">
                {waliDosen}
              </strong>
              . Selalu siap saling bantu untuk tugas, ujian, dan kegiatan kampus.
            </p>
          </div>

          {showStats && (
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 shrink-0">
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 text-center space-y-1">
                <Users className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400" />
                <div className="text-2xl font-extrabold text-[var(--text-primary)]">
                  {studentsCount}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-medium">
                  Mahasiswa Aktif
                </div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/40 text-center space-y-1">
                <Award className="w-5 h-5 mx-auto text-purple-600 dark:text-purple-400" />
                <div className="text-2xl font-extrabold text-[var(--text-primary)]">
                  {achievementsCount}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-medium">
                  Prestasi Diraih
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
