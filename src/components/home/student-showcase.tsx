"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { StudentCard, StudentData } from "@/components/students/student-card";
import { StudentProfile } from "@/components/students/student-profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { StudentsSettings } from "@/lib/homepage/types";

export interface StudentShowcaseProps {
  students: StudentData[];
  settings?: StudentsSettings;
  className?: string;
}

export function StudentShowcase({ students, settings, className }: StudentShowcaseProps) {
  const [selectedStudent, setSelectedStudent] = React.useState<StudentData | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const max = settings?.maxItems ?? 4;
  const displayStudents = (students || []).slice(0, max);
  const title = settings?.title || "Profil Mahasiswa Kelas";
  const description = settings?.description;

  const handleStudentClick = (student: StudentData) => {
    setSelectedStudent(student);
    setProfileOpen(true);
  };

  if (!students || students.length === 0) {
    return (
      <section className={cn("space-y-4 text-left", className)}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              {"// Profil"}
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
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 flex items-center justify-center mx-auto text-cyan-400 light:text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                Belum ada data mahasiswa
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                Daftar profil mahasiswa kelas akan tampil di sini setelah data ditambahkan di direktori.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/students">
                <Button variant="outline" size="sm" className="text-xs cursor-pointer">
                  Buka Direktori Mahasiswa
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              {"// Profil"}
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

      <div
        className={cn(
          "grid gap-4",
          displayStudents.length === 1
            ? "grid-cols-1 max-w-md"
            : displayStudents.length === 2
            ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
            : displayStudents.length === 3
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {displayStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onClick={() => handleStudentClick(student)}
          />
        ))}
      </div>

      <StudentProfile
        student={selectedStudent}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </section>
  );
}
