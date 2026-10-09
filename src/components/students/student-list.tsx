"use client";

import * as React from "react";
import { Trophy, ArrowRight, ExternalLink, Users } from "lucide-react";
import { StudentData } from "./student-card";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface StudentListProps {
  students: StudentData[];
  onStudentClick?: (student: StudentData) => void;
  className?: string;
}

export function StudentList({
  students,
  onStudentClick,
  className,
}: StudentListProps) {
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
    <div className={cn("space-y-2.5", className)}>
      {students.map((student) => {
        const achievementCount = student.achievements?.length || 0;
        return (
          <Card
            key={student.id}
            variant="interactive"
            padding="sm"
            onClick={() => onStudentClick?.(student)}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left p-3.5 sm:p-4"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <Avatar
                src={student.photoUrl}
                name={student.name}
                size="md"
              />
              <div className="min-w-0 space-y-0.5">
                <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">
                  {student.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] truncate">
                  <span>{student.major || "S1 Sistem Informasi"}</span>
                  <span>•</span>
                  <span>{student.className || "JS1SI-26-REG-05"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]">
              {achievementCount > 0 && (
                <Badge variant="yellow" className="text-xs gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>{achievementCount} Prestasi</span>
                </Badge>
              )}
              <ArrowRight className="w-4 h-4 text-cyan-400 light:text-blue-600 hidden sm:block" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
