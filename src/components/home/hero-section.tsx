"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  Users,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeroSectionProps {
  classCode?: string;
  classNameTitle?: string;
  majorName?: string;
  institutionName?: string;
  academicYear?: string;
  className?: string;
}

export function HeroSection({
  classCode = "JS1SI-26-REG-05",
  classNameTitle = "S1 Sistem Informasi",
  majorName = "S1 Sistem Informasi",
  institutionName = "Telkom University Jakarta",
  academicYear = "Semester Ganjil 2026/2027",
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative min-h-[85vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-center",
        className
      )}
    >
      {/* Ambient Lighting & Glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] rounded-full pointer-events-none opacity-30 light:opacity-10 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, #2563eb 0%, #06b6d4 45%, transparent 75%)",
        }}
      />
      <div
        className="absolute top-1/3 left-10 w-64 h-64 rounded-full pointer-events-none opacity-20 light:opacity-5 blur-[90px]"
        style={{
          background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-10 right-10 w-72 h-72 rounded-full pointer-events-none opacity-20 light:opacity-5 blur-[100px]"
        style={{
          background: "radial-gradient(circle, #1d4ed8 0%, transparent 70%)",
        }}
      />

      {/* Subtle Abstract Grid Lines */}
      <div className="absolute inset-0 cyber-grid opacity-25 light:opacity-10 pointer-events-none" />

      {/* Hero Content Container */}
      <div className="max-w-4xl mx-auto relative z-10 space-y-6 sm:space-y-8">
        {/* Eyebrow Pill: Class Identity */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 text-xs sm:text-sm font-semibold tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(6,182,212,0.2)] light:shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-pulse" />
          <span>
            {classCode} &bull; {academicYear}
          </span>
        </div>

        {/* Display Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-[var(--text-primary)]">
            Academic Class Hub{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 light:from-blue-600 light:via-cyan-600 light:to-blue-800">
              {classCode}
            </span>
          </h1>

          <p className="text-base sm:text-xl font-medium text-cyan-200/90 light:text-blue-800 font-mono tracking-wide">
            {majorName} &bull; {institutionName}
          </p>
        </div>

        {/* Lead Description */}
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Pusat ekosistem digital terintegrasi untuk kelas {classCode} —
          memfasilitasi jadwal kuliah presisi, manajemen tugas multi-view,
          repositori materi, jurnal pembelajaran harian, serta rekam prestasi
          mahasiswa.
        </p>

        {/* Interactive CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/schedule">
            <Button
              variant="primary"
              size="lg"
              className="rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Jadwal Kuliah
            </Button>
          </Link>

          <Link href="/tasks">
            <Button
              variant="secondary"
              size="lg"
              className="rounded-xl"
              leftIcon={<CheckSquare className="w-4 h-4" />}
            >
              Planner Tugas
            </Button>
          </Link>

          <Link href="/students">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl"
              leftIcon={<Users className="w-4 h-4" />}
            >
              Direktori Mahasiswa
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
