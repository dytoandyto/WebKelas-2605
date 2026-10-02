"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { StudentCard, StudentData } from "@/components/students/student-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StudentShowcaseProps {
  students: StudentData[];
  className?: string;
}

export function StudentShowcase({ students, className }: StudentShowcaseProps) {
  if (!students || students.length === 0) return null;

  const displayStudents = students.slice(0, 4);

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              // Cohort Directory
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Profil Mahasiswa Kelas
          </h2>
        </div>

        <Link href="/students">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-cyan-400 light:text-blue-600 font-semibold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Lihat Semua Mahasiswa
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStudents.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
}
