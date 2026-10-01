"use client";

import * as React from "react";
import Link from "next/link";
import { Trophy, ExternalLink, ArrowRight, GraduationCap } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StudentData {
  id: string;
  studentNumber?: string | null;
  name: string;
  photoUrl?: string | null;
  major: string;
  className?: string | null;
  bio?: string | null;
  dream?: string | null;
  motivation?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  instagramUrl?: string | null;
  achievements?: (
    | {
        id: string;
        title: string;
        category?: string | null;
      }
    | {
        achievement: {
          id: string;
          title: string;
          category?: string | null;
          badgeIconUrl?: string | null;
        };
      }
    | any
  )[];
}

export interface StudentCardProps {
  student: StudentData;
  onClick?: () => void;
  className?: string;
}

export function StudentCard({ student, onClick, className }: StudentCardProps) {
  const achievementCount = student.achievements?.length || 0;

  return (
    <Card
      variant="interactive"
      padding="md"
      onClick={onClick}
      className={cn(
        "flex flex-col justify-between text-left space-y-4 select-none",
        className
      )}
    >
      <div className="space-y-3">
        {/* Avatar & Badges */}
        <div className="flex items-start justify-between gap-3">
          <Avatar
            src={student.photoUrl}
            name={student.name}
            size="lg"
            className="ring-2 ring-cyan-400/40 light:ring-blue-300"
          />

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {achievementCount > 0 ? (
              <Badge variant="yellow" className="text-[11px] gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>{achievementCount} Prestasi</span>
              </Badge>
            ) : (
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                {student.className || "REG-05"}
              </span>
            )}
          </div>
        </div>

        {/* Student Name & Major */}
        <div>
          <h4 className="text-base font-bold text-[var(--text-primary)] tracking-tight line-clamp-1 hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
            {student.name}
          </h4>
          <p className="text-xs text-cyan-400 light:text-blue-700 font-medium truncate mt-0.5">
            {student.major}
          </p>
        </div>

        {/* Motivation / Dream excerpt */}
        {(student.motivation || student.dream || student.bio) && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic leading-relaxed">
            "{student.motivation || student.dream || student.bio}"
          </p>
        )}
      </div>

      {/* Social Links & Profile Action */}
      <div className="pt-3 border-t border-[var(--border-color)]/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {student.githubUrl && (
            <a
              href={student.githubUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-cyan-500/10 transition-colors"
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
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-blue-400 hover:bg-cyan-500/10 transition-colors"
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
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              title="Portofolio Web"
            >
              <ExternalLink size={14} />
            </a>
          )}
          {student.instagramUrl && (
            <a
              href={student.instagramUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-pink-500 hover:bg-pink-500/10 transition-colors"
              title="Instagram Profile"
            >
              <InstagramIcon size={14} />
            </a>
          )}
        </div>

        <div className="text-xs font-semibold text-cyan-400 light:text-blue-600 flex items-center gap-1">
          <span>Profil</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  );
}
