"use client";

import * as React from "react";
import Link from "next/link";
import { Users, BookOpen, CheckSquare, FileText, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AcademicStatsData {
  studentsCount: number;
  subjectsCount: number;
  tasksCount: number;
  materialsCount: number;
  achievementsCount: number;
}

export interface AcademicStatsProps {
  stats: AcademicStatsData;
  className?: string;
}

export function AcademicStats({ stats, className }: AcademicStatsProps) {
  const items = [
    {
      label: "Mahasiswa",
      value: stats.studentsCount,
      href: "/students",
      icon: Users,
      color: "text-blue-400",
      accentBg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Mata Kuliah",
      value: stats.subjectsCount,
      href: "/subjects",
      icon: BookOpen,
      color: "text-cyan-400",
      accentBg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Tugas Aktif",
      value: stats.tasksCount,
      href: "/tasks",
      icon: CheckSquare,
      color: "text-amber-400",
      accentBg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Materi Kuliah",
      value: stats.materialsCount,
      href: "/materials",
      icon: FileText,
      color: "text-emerald-400",
      accentBg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Prestasi Kelas",
      value: stats.achievementsCount,
      href: "/achievements",
      icon: Trophy,
      color: "text-purple-400",
      accentBg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4",
        className
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "group block h-full focus-visible:outline-none",
              index === 4 && "col-span-2 sm:col-span-1"
            )}
          >
            <Card
              variant="interactive"
              padding="sm"
              className="h-full p-3.5 sm:p-4 text-left flex items-center gap-3 transition-all duration-200"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  item.accentBg
                )}
              >
                <Icon className={cn("w-5 h-5", item.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs text-[var(--text-secondary)] truncate font-medium">
                  {item.label}
                </div>
              </div>
              <div className="text-[var(--text-muted)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors shrink-0">
                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity hidden lg:inline mr-1">&rarr;</span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
