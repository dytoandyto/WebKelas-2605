"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { StudentCard, StudentData } from "@/components/students/student-card";
import { StudentProfile } from "@/components/students/student-profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StudentShowcaseProps {
  students: StudentData[];
  className?: string;
}

export function StudentShowcase({ students, className }: StudentShowcaseProps) {
  const [selectedStudent, setSelectedStudent] = React.useState<StudentData | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  if (!students || students.length === 0) return null;

  const displayStudents = students.slice(0, 4);

  const handleStudentClick = (student: StudentData) => {
    setSelectedStudent(student);
    setProfileOpen(true);
  };

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              // Profil
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
