"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  BookOpen,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroSettings } from "@/lib/homepage/types";

export interface HeroSectionProps {
  classCode?: string;
  classNameTitle?: string;
  majorName?: string;
  institutionName?: string;
  academicYear?: string;
  waliDosen?: string;
  settings?: HeroSettings;
  className?: string;
}

export function HeroSection({
  classCode = "JS1SI-26-REG-05",
  classNameTitle = "S1 Sistem Informasi",
  majorName = "S1 Sistem Informasi",
  institutionName = "Telkom University Jakarta",
  academicYear = "Semester Ganjil 2026/2027",
  waliDosen = "Muhammad Ardiansyah",
  settings,
  className,
}: HeroSectionProps) {
  // Use CMS settings if provided, else fallback
  const effectiveClassCode = settings?.title || classCode;
  const effectiveEyebrow = settings?.eyebrow || "Ruang Digital Kelas";
  const effectiveAcademicYear = settings?.academicYear || academicYear;
  const effectiveSubtitle = settings?.subtitle || `${classNameTitle || majorName} • ${institutionName}`;
  const effectiveDescription =
    settings?.description ||
    "Satu tempat untuk semua urusan kelas. Pantau jadwal, sikat deadline tugas, akses materi & artikel, dan update info seputar teman sekelas—semua rapi dan gampang diakses kapan aja.";

  return (
    <section
      className={cn(
        "relative flex items-center justify-center pt-20 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-center",
        className
      )}
    >
      {/* Ambient Lighting & Radiant Blooms (Subtle in Light Mode, Deep in Dark Mode) */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[860px] h-[360px] rounded-full pointer-events-none blur-[110px] opacity-70 dark:opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, rgba(56,189,248,0.1) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute -top-10 left-1/4 w-72 h-72 rounded-full pointer-events-none blur-[90px] opacity-40 dark:opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-4 right-1/4 w-80 h-80 rounded-full pointer-events-none blur-[100px] opacity-40 dark:opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Hero Content Container */}
      <div className="max-w-4xl mx-auto relative z-10 space-y-6 sm:space-y-8">
        {/* Eyebrow Pill: Class Identity */}
        {(settings?.showBadges ?? true) && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium tracking-wide shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shrink-0" />
            <span className="font-semibold uppercase tracking-wider text-[11px] sm:text-xs">
              {effectiveEyebrow}
            </span>
            <span className="text-slate-300 dark:text-slate-600">&bull;</span>
            <span className="font-mono text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
              {effectiveAcademicYear}
            </span>
          </div>
        )}

        {/* Display Headline */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white">
            Academic Class Hub{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-teal-300">
              {effectiveClassCode}
            </span>
          </h1>

          <p className="text-base sm:text-lg font-semibold text-blue-700 dark:text-cyan-300/90 font-mono tracking-wide">
            {effectiveSubtitle}
          </p>

          {(settings?.showClassPills ?? true) && waliDosen && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-mono">
              <span className="text-slate-500 dark:text-slate-400">Wali Dosen:</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">{waliDosen}</span>
            </div>
          )}
        </div>

        {/* Lead Description */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {effectiveDescription}
        </p>

        {/* Interactive CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {settings ? (
            <>
              {settings.primaryButtonVisible && (
                <Link href={settings.primaryButtonUrl || "/schedule"}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-xl shadow-xs hover:shadow-md cursor-pointer"
                    leftIcon={<Calendar className="w-4 h-4" />}
                  >
                    {settings.primaryButtonText || "Jadwal Perkuliahan"}
                  </Button>
                </Link>
              )}

              {settings.secondaryButtonVisible && (
                <Link href={settings.secondaryButtonUrl || "/tasks"}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="rounded-xl cursor-pointer"
                    leftIcon={<CheckSquare className="w-4 h-4" />}
                  >
                    {settings.secondaryButtonText || "Tugas & Deadline"}
                  </Button>
                </Link>
              )}

              <Link href="/articles">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl cursor-pointer"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                >
                  Artikel Edukasi
                </Button>
              </Link>

              <Link href="/students">
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-xl cursor-pointer text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                  leftIcon={<Users className="w-4 h-4" />}
                >
                  Teman Sekelas
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/schedule">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-xl shadow-xs hover:shadow-md cursor-pointer"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  Jadwal Kuliah
                </Button>
              </Link>

              <Link href="/tasks">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-xl cursor-pointer"
                  leftIcon={<CheckSquare className="w-4 h-4" />}
                >
                  Tugas & Deadline
                </Button>
              </Link>

              <Link href="/articles">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl cursor-pointer"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                >
                  Artikel Edukasi
                </Button>
              </Link>

              <Link href="/students">
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-xl cursor-pointer text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                  leftIcon={<Users className="w-4 h-4" />}
                >
                  Teman Sekelas
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}