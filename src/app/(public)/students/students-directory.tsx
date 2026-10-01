"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, Grid as GridIcon, List as ListIcon } from "lucide-react";
import { StudentData, StudentGrid, StudentList, StudentProfile } from "@/components/students";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface StudentsDirectoryProps {
  initialStudents: StudentData[];
  majors: string[];
}

export function StudentsDirectory({
  initialStudents,
  majors,
}: StudentsDirectoryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "achievements">("name");
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const filtered = useMemo(() => {
    return initialStudents
      .filter((s) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          s.name.toLowerCase().includes(q) ||
          (s.studentNumber && s.studentNumber.toLowerCase().includes(q)) ||
          (s.major && s.major.toLowerCase().includes(q)) ||
          (s.motivation && s.motivation.toLowerCase().includes(q));

        if (!matchesSearch) return false;
        if (selectedMajor !== "ALL" && s.major !== selectedMajor) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "achievements") {
          const achA = a.achievements?.length || 0;
          const achB = b.achievements?.length || 0;
          return achB - achA;
        }
        return a.name.localeCompare(b.name);
      });
  }, [initialStudents, searchQuery, selectedMajor, sortBy]);

  const handleStudentClick = (student: StudentData) => {
    setSelectedStudent(student);
    setProfileOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cari berdasarkan nama, NIM, atau minat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Filter and Sort Options */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {majors.length > 1 && (
            <div className="w-48">
              <Select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
              >
                <option value="ALL">Semua Program Studi</option>
                {majors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="w-44">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">Nama (A-Z)</option>
              <option value="achievements">Prestasi Terbanyak</option>
            </Select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] light:bg-slate-100">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              title="Grid View"
            >
              <GridIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Roster Display */}
      {viewMode === "grid" ? (
        <StudentGrid students={filtered} onStudentClick={handleStudentClick} />
      ) : (
        <StudentList students={filtered} onStudentClick={handleStudentClick} />
      )}

      {/* Student Profile Dialog */}
      <StudentProfile
        student={selectedStudent}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </div>
  );
}
