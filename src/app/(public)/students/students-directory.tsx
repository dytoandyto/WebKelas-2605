"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  Trophy,
  ExternalLink,
  ArrowRight,
  GraduationCap,
  Grid as GridIcon,
  List as ListIcon,
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="card p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NIM, atau impian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl"
          />
        </div>

        {/* Filter and Sort options */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {majors.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[var(--primary)]" />
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="input text-xs py-2 px-3 rounded-xl"
              >
                <option value="ALL">Semua Program Studi</option>
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
            className="input text-xs py-2 px-3 rounded-xl"
          >
            <option value="name">Urutkan: Nama (A-Z)</option>
            <option value="achievements">Urutkan: Prestasi Terbanyak</option>
          </select>

          {/* View Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <GridIcon size={14} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "list"
                  ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <ListIcon size={14} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Grid Mode */}
      {viewMode === "grid" && (
        <>
          {filtered.length === 0 ? (
            <div className="card p-12 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4 text-[var(--primary)]">
                <Users size={26} />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">Mahasiswa Tidak Ditemukan</h3>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
                Tidak ada mahasiswa yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((student) => {
                const achievementsCount = student.achievements?.length || 0;
                return (
                  <div
                    key={student.id}
                    className="card p-5 bg-[var(--bg-surface)] hover:border-[var(--primary)] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-1"
                  >
                    <div>
                      {/* Avatar & Badges Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-lg shadow-sm border border-cyan-300/30 shrink-0">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            student.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        {achievementsCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30">
                            <Trophy size={11} className="text-amber-400" />
                            <span>{achievementsCount} Prestasi</span>
                          </span>
                        )}
                      </div>

                      {/* Student Identity */}
                      <Link href={`/students/${student.id}`} className="block group-hover:text-[var(--primary)] transition-colors">
                        <h3 className="font-bold text-[var(--text-primary)] text-base leading-snug line-clamp-1">
                          {student.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-muted)] font-mono">
                        <span className="font-semibold text-[var(--primary)] dark:text-cyan-400 truncate">{student.major}</span>
                        {student.studentNumber && (
                          <>
                            <span>&bull;</span>
                            <span>{student.studentNumber}</span>
                          </>
                        )}
                      </div>

                      {/* Motivation / Dream */}
                      {student.motivation ? (
                        <p className="text-[var(--text-secondary)] text-xs italic mt-3 line-clamp-2 leading-relaxed bg-[var(--bg-muted)]/70 p-2.5 rounded-xl border border-[var(--border-color)]/50">
                          &ldquo;{student.motivation}&rdquo;
                        </p>
                      ) : student.dream ? (
                        <p className="text-[var(--text-secondary)] text-xs mt-3 line-clamp-2 leading-relaxed bg-[var(--bg-muted)]/70 p-2.5 rounded-xl border border-[var(--border-color)]/50">
                          🎯 Cita-cita: {student.dream}
                        </p>
                      ) : null}
                    </div>

                    {/* Socials & Profile Action */}
                    <div className="pt-3.5 border-t border-[var(--border-color)]/60 mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        {student.githubUrl && (
                          <a
                            href={student.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--text-primary)] transition-colors p-1"
                            aria-label="GitHub"
                          >
                            <GithubIcon size={14} />
                          </a>
                        )}
                        {student.linkedinUrl && (
                          <a
                            href={student.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--text-primary)] transition-colors p-1"
                            aria-label="LinkedIn"
                          >
                            <LinkedinIcon size={14} />
                          </a>
                        )}
                        {student.portfolioUrl && (
                          <a
                            href={student.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--text-primary)] transition-colors p-1"
                            aria-label="Portfolio"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      <Link
                        href={`/students/${student.id}`}
                        className="text-xs font-bold text-[var(--primary)] dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Profil</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Directory Compact List Mode */}
      {viewMode === "list" && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full text-left text-xs">
              <thead className="bg-[var(--bg-muted)] text-[var(--text-muted)] font-mono border-b border-[var(--border-color)]">
                <tr>
                  <th className="p-3.5">MAHASISWA</th>
                  <th className="p-3.5">NIM</th>
                  <th className="p-3.5">PROGRAM STUDI</th>
                  <th className="p-3.5">PRESTASI</th>
                  <th className="p-3.5">TAUTAN</th>
                  <th className="p-3.5 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {filtered.map((student) => {
                  const achievementsCount = student.achievements?.length || 0;
                  return (
                    <tr key={student.id} className="hover:bg-[var(--bg-muted)]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--primary)]/15 flex items-center justify-center text-xs font-bold text-[var(--primary)] shrink-0">
                            {student.photoUrl ? (
                              <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              student.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/students/${student.id}`}
                              className="font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors block"
                            >
                              {student.name}
                            </Link>
                            {student.dream && (
                              <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                                Goal: {student.dream}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[var(--text-secondary)]">
                        {student.studentNumber || "-"}
                      </td>
                      <td className="p-3.5 text-[var(--text-secondary)]">
                        {student.major}
                      </td>
                      <td className="p-3.5">
                        {achievementsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            <Trophy size={10} />
                            <span>{achievementsCount} Prestasi</span>
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">-</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                          {student.githubUrl && (
                            <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
                              <GithubIcon size={13} />
                            </a>
                          )}
                          {student.linkedinUrl && (
                            <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
                              <LinkedinIcon size={13} />
                            </a>
                          )}
                          {student.portfolioUrl && (
                            <a href={student.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/students/${student.id}`}
                          className="btn btn-secondary px-2.5 py-1 text-xs inline-flex items-center gap-1"
                        >
                          <span>Lihat</span>
                          <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
