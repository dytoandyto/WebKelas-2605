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
      <div className="cyber-card p-4 sm:p-5 rounded-2xl bg-[#0a1a2f]/70 border border-cyan-500/20 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            placeholder="Search by name, student number (NIM), or dream..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#061021]/90 border border-cyan-500/25 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
          />
        </div>

        {/* Filter and Sort options */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {majors.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-cyan-400" />
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="bg-[#061021]/90 border border-cyan-500/25 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Majors</option>
                {majors.map((m) => (
                  <option key={m} value={m} className="bg-[#061021] text-slate-100">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#061021]/90 border border-cyan-500/25 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="name" className="bg-[#061021] text-slate-100">Sort by Name (A-Z)</option>
            <option value="achievements" className="bg-[#061021] text-slate-100">Sort by Honors Count</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      {filtered.length === 0 ? (
        <div className="cyber-card p-12 text-center rounded-2xl bg-[#0a1a2f]/60 border border-cyan-500/20">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Users size={26} />
          </div>
          <h3 className="font-bold text-white text-lg mb-1">No students found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
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
                className="cyber-card rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-cyan-glow bg-[#0a1a2f]/75 transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
              >
                <div className="p-5">
                  {/* Avatar & Badges Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-cyan-glow border border-cyan-300/40">
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                        <Trophy size={11} className="text-amber-400" />
                        <span>{achievementsCount} {achievementsCount === 1 ? "Award" : "Awards"}</span>
                      </span>
                    )}
                  </div>

                  {/* Student Identity */}
                  <Link href={`/students/${student.id}`} className="block group-hover:text-cyan-300 transition-colors">
                    <h3 className="font-extrabold text-white text-base leading-snug line-clamp-1">
                      {student.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-400">
                    <span className="font-medium text-cyan-400/90 truncate">{student.major}</span>
                    {student.studentNumber && (
                      <>
                        <span>&bull;</span>
                        <span className="font-mono text-slate-400">{student.studentNumber}</span>
                      </>
                    )}
                  </div>

                  {/* Motivation / Dream */}
                  {student.motivation ? (
                    <p className="text-slate-300 text-xs italic mt-3 line-clamp-2 leading-relaxed bg-[#061021]/80 p-3 rounded-xl border border-cyan-500/10">
                      &ldquo;{student.motivation}&rdquo;
                    </p>
                  ) : student.dream ? (
                    <p className="text-slate-300 text-xs mt-3 line-clamp-2 leading-relaxed bg-[#061021]/80 p-3 rounded-xl border border-cyan-500/10">
                      🎯 Goal: {student.dream}
                    </p>
                  ) : null}

                  {/* Recent Honors Preview */}
                  {student.achievements && student.achievements.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {student.achievements.slice(0, 2).map((sa: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-cyan-950/60 border border-cyan-500/25 text-cyan-300 px-2 py-0.5 rounded-full truncate max-w-[180px]"
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
                <div className="px-5 py-3 bg-[#061021]/70 border-t border-cyan-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {student.githubUrl && (
                      <a
                        href={student.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-cyan-300 transition-colors"
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
                        className="text-slate-400 hover:text-cyan-300 transition-colors"
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
                        className="text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Portfolio Website"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/students/${student.id}`}
                    className="text-xs font-bold text-cyan-300 hover:text-white inline-flex items-center gap-1 transition-colors"
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
