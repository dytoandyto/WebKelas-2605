"use client";

import * as React from "react";
import Link from "next/link";
import { Trophy, ExternalLink, GraduationCap, Sparkles, Heart, ArrowRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/icons";
import { StudentData } from "./student-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getAchievementBadge } from "@/components/achievements/achievement-card";
import {
  formatDate,
  formatExternalUrl,
  formatGithubUrl,
  formatInstagramUrl,
  formatLinkedinUrl,
  formatPhotoUrl,
} from "@/lib/utils";

export interface StudentProfileProps {
  student: StudentData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentProfile({
  student,
  open,
  onOpenChange,
}: StudentProfileProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left pt-2">
            <Avatar
              src={student.photoUrl}
              name={student.name}
              size="xl"
              className="ring-4 ring-cyan-400/40 light:ring-blue-300"
            />
            <div className="space-y-1">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {student.name}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-cyan-400 light:text-blue-700">
                  {student.className || "JS1SI-26-REG-05"}
                </span>
                {student.attendanceNumber && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 light:bg-blue-50 light:text-blue-700 light:border-blue-200">
                    Absen #{student.attendanceNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                {student.major || "S1 Sistem Informasi"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-left">
          {/* Bio */}
          {student.bio && (
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] space-y-1">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Tentang Mahasiswa
              </h5>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {student.bio}
              </p>
            </div>
          )}

          {/* Dream & Motivation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {student.dream && (
              <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 light:bg-blue-50/50 light:border-blue-200 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 light:text-blue-700 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Impian & Visi Karier
                </span>
                <p className="text-xs sm:text-sm text-[var(--text-primary)]">
                  {student.dream}
                </p>
              </div>
            )}

            {student.motivation && (
              <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 light:bg-sky-50/50 light:border-sky-200 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 light:text-sky-700 font-mono flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Motto & Motivasi
                </span>
                <p className="text-xs sm:text-sm text-[var(--text-primary)] italic">
                  "{student.motivation}"
                </p>
              </div>
            )}
          </div>

          {/* Achievements Showcase */}
          {student.achievements && student.achievements.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Rekam Prestasi & Penghargaan ({student.achievements.length})
              </h5>
              <div className="space-y-2">
                {student.achievements.map((item: any, idx: number) => {
                  const ach = item.achievement || item;
                  return (
                    <div
                      key={ach.id || idx}
                      className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 light:bg-amber-50/50 light:border-amber-200 flex flex-col gap-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="text-base shrink-0 mt-0.5">
                            {ach.badgeIconUrl ? (
                              ach.badgeIconUrl.startsWith("http") ||
                              ach.badgeIconUrl.startsWith("/") ||
                              ach.badgeIconUrl.startsWith("data:") ? (
                                <img
                                  src={formatPhotoUrl(ach.badgeIconUrl)}
                                  alt="Badge"
                                  className="w-4 h-4 object-contain inline"
                                />
                              ) : (
                                ach.badgeIconUrl
                              )
                            ) : (
                              "🏆"
                            )}
                          </span>
                          <div className="min-w-0">
                            <h6 className="font-bold text-[var(--text-primary)] leading-snug">
                              {ach.title}
                            </h6>
                            {(ach.organization || ach.achievementDate) && (
                              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-mono mt-0.5 flex-wrap">
                                {ach.organization && (
                                  <span className="text-cyan-400 light:text-blue-700 font-medium">
                                    {ach.organization}
                                  </span>
                                )}
                                {ach.achievementDate && (
                                  <span>{formatDate(ach.achievementDate)}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {ach.category && getAchievementBadge(ach.category)}
                      </div>

                      {ach.id && (
                        <div className="pt-2 border-t border-amber-500/20 flex justify-end">
                          <Link
                            href={`/achievements#${ach.id}`}
                            onClick={() => onOpenChange(false)}
                            className="text-[11px] font-semibold text-cyan-400 light:text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Lihat Detail Prestasi</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Social Profiles */}
          <div className="flex items-center gap-3 pt-2">
            {student.githubUrl && (
              <a
                href={formatGithubUrl(student.githubUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-cyan-400/50 text-xs font-medium text-[var(--text-primary)] transition-colors light:bg-slate-100"
              >
                <GithubIcon size={14} />
                <span>GitHub</span>
              </a>
            )}
            {student.linkedinUrl && (
              <a
                href={formatLinkedinUrl(student.linkedinUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-blue-400/50 text-xs font-medium text-blue-400 transition-colors light:bg-slate-100"
              >
                <LinkedinIcon size={14} />
                <span>LinkedIn</span>
              </a>
            )}
            {student.portfolioUrl && (
              <a
                href={formatExternalUrl(student.portfolioUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-cyan-400/50 text-xs font-medium text-cyan-300 transition-colors light:bg-slate-100"
              >
                <ExternalLink size={14} />
                <span>Portofolio</span>
              </a>
            )}
            {student.instagramUrl && (
              <a
                href={formatInstagramUrl(student.instagramUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-pink-400/50 text-xs font-medium text-pink-500 hover:text-pink-600 transition-colors light:bg-slate-100"
              >
                <InstagramIcon size={14} />
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between w-full pt-2">
          <Link
            href={`/students/${student.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 light:text-blue-600 light:hover:text-blue-700 transition-colors"
          >
            <span>Buka Halaman Lengkap</span>
            <ArrowRight size={14} />
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
