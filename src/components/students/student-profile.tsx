"use client";

import * as React from "react";
import { Trophy, ExternalLink, GraduationCap, Sparkles, Heart } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/icons";
import { StudentData } from "./student-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
              <p className="text-sm font-semibold text-cyan-400 light:text-blue-700">
                {student.className || "JS1SI-26-REG-05"}
              </p>
              {student.studentNumber && (
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  NIM: {student.studentNumber}
                </p>
              )}
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
                <Trophy className="w-3.5 h-3.5" /> Rekam Prestasi & Penghargaan
              </h5>
              <div className="space-y-1.5">
                {student.achievements.map((item: any, idx: number) => {
                  const ach = item.achievement || item;
                  return (
                    <div
                      key={ach.id || idx}
                      className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 light:bg-amber-50/50 light:border-amber-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-[var(--text-primary)]">
                        {ach.title}
                      </span>
                      {ach.category && (
                        <Badge variant="yellow" size="sm">
                          {ach.category}
                        </Badge>
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
                href={student.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-cyan-400/50 text-xs font-medium text-[var(--text-primary)] transition-colors light:bg-slate-100"
              >
                <GithubIcon size={14} />
                <span>GitHub</span>
              </a>
            )}
            {student.linkedinUrl && (
              <a
                href={student.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-blue-400/50 text-xs font-medium text-blue-400 transition-colors light:bg-slate-100"
              >
                <LinkedinIcon size={14} />
                <span>LinkedIn</span>
              </a>
            )}
            {student.portfolioUrl && (
              <a
                href={student.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-cyan-400/50 text-xs font-medium text-cyan-300 transition-colors light:bg-slate-100"
              >
                <ExternalLink size={14} />
                <span>Portofolio</span>
              </a>
            )}
            {student.instagramUrl && (
              <a
                href={student.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-pink-400/50 text-xs font-medium text-pink-500 hover:text-pink-600 transition-colors light:bg-slate-100"
              >
                <InstagramIcon size={14} />
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>

        <DialogFooter>
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
