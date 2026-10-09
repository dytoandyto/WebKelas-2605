"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { StudentData, StudentCard } from "./student-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface StudentGridProps {
  students: StudentData[];
  onStudentClick?: (student: StudentData) => void;
  className?: string;
}

export function StudentGrid({
  students,
  onStudentClick,
  className,
}: StudentGridProps) {
  if (students.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-6 h-6 text-cyan-400" />}
        title="Belum ada teman yang cocok"
        description="Coba cari dengan kata kunci nama atau minat yang lain."
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5",
        className
      )}
    >
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          onClick={() => onStudentClick?.(student)}
        />
      ))}
    </div>
  );
}
