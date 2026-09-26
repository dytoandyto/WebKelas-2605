"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  Trophy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface StudentItem {
  id: string;
  studentNumber?: string | null;
  name: string;
  photoUrl?: string | null;
  major: string;
  bio?: string | null;
  dream?: string | null;
  motivation?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  achievements?: any[];
}

interface StudentsDirectoryProps {
  initialStudents: StudentItem[];
  majors: string[];
}

export function StudentsDirectory({ initialStudents, majors }: StudentsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "achievements">("name");

  const filtered = initialStudents
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

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="card p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, student number (NIM), or dream..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        {/* Filter and Sort options */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {majors.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="input py-2 text-xs"
              >
                <option value="ALL">All Majors</option>
                {majors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input py-2 text-xs"
          >
            <option value="name">Sort by Name (A-Z)</option>
            <option value="achievements">Sort by Honors Count</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto mb-4 text-cyan-600">
            <Users size={26} />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">No students found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            {searchQuery
              ? `No student matching "${searchQuery}". Try a different name or NIM.`
              : "No students are listed in this filter category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((student) => {
            const achievementsCount = student.achievements?.length || 0;
            return (
              <div
                key={student.id}
                className="card border border-slate-200/80 hover:border-cyan-500/40 transition-all hover:shadow-lg flex flex-col justify-between overflow-hidden group bg-white"
              >
                <div className="p-5">
                  {/* Avatar & Badges Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          student.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>

                    {achievementsCount > 0 && (
                      <span className="badge badge-amber text-xs flex items-center gap-1 font-semibold">
                        <Trophy size={11} className="text-amber-600" />
                        <span>{achievementsCount} {achievementsCount === 1 ? "Award" : "Awards"}</span>
                      </span>
                    )}
                  </div>

                  {/* Student Identity */}
                  <Link href={`/students/${student.id}`} className="block group-hover:text-cyan-700 transition-colors">
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {student.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
                    <span className="font-medium text-slate-600 truncate">{student.major}</span>
                    {student.studentNumber && (
                      <>
                        <span>&bull;</span>
                        <span className="font-mono text-slate-400">{student.studentNumber}</span>
                      </>
                    )}
                  </div>

                  {/* Motivation / Dream */}
                  {student.motivation ? (
                    <p className="text-slate-600 text-xs italic mt-3 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      &ldquo;{student.motivation}&rdquo;
                    </p>
                  ) : student.dream ? (
                    <p className="text-slate-500 text-xs mt-3 line-clamp-2 leading-relaxed">
                      🎯 Goal: {student.dream}
                    </p>
                  ) : null}

                  {/* Recent Honors Preview */}
                  {student.achievements && student.achievements.length > 0 && (
                    <div className="mt-3 flex items-center gap-1 flex-wrap">
                      {student.achievements.slice(0, 2).map((sa: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-cyan-50 border border-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full truncate max-w-[180px]"
                          title={sa.achievement?.title}
                        >
                          {sa.achievement?.badgeIconUrl ? `${sa.achievement.badgeIconUrl} ` : "🏆 "}
                          {sa.achievement?.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Socials & Link */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {student.githubUrl && (
                      <a
                        href={student.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-800 transition-colors"
                        title="GitHub Profile"
                      >
                        <GithubIcon size={14} />
                      </a>
                    )}
                    {student.linkedinUrl && (
                      <a
                        href={student.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <LinkedinIcon size={14} />
                      </a>
                    )}
                    {student.portfolioUrl && (
                      <a
                        href={student.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-cyan-600 transition-colors"
                        title="Portfolio Website"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/students/${student.id}`}
                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 inline-flex items-center gap-1"
                  >
                    <span>Profile</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
