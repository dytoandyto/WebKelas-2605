"use client";

import * as React from "react";
import Image from "next/image";
import { Trophy, Calendar, Building, Users } from "lucide-react";
import { AchievementCategory } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";

export interface AchievementData {
  id: string;
  title: string;
  description?: string | null;
  category: AchievementCategory | string;
  achievementDate: Date | string;
  organization?: string | null;
  location?: string | null;
  badgeIconUrl?: string | null;
  imageUrl?: string | null;
  students?: {
    student: {
      id: string;
      name: string;
      photoUrl?: string | null;
      major: string;
    };
  }[];
}

export interface AchievementCardProps {
  achievement: AchievementData;
  onClick?: () => void;
  className?: string;
}

export function getAchievementBadge(category: string) {
  switch (category) {
    case "COMPETITION":
      return <Badge variant="yellow">Kompetisi</Badge>;
    case "TECHNOLOGY":
      return <Badge variant="cyan">Teknologi</Badge>;
    case "ACADEMIC":
      return <Badge variant="blue">Akademik</Badge>;
    case "VOLUNTEER":
      return <Badge variant="green">Sosial</Badge>;
    case "ORGANIZATION":
      return <Badge variant="purple">Organisasi</Badge>;
    case "CREATIVE":
      return <Badge variant="red">Kreatif</Badge>;
    default:
      return <Badge variant="default">{category}</Badge>;
  }
}

export function AchievementCard({
  achievement,
  onClick,
  className,
}: AchievementCardProps) {
  const students = achievement.students || [];

  return (
    <Card
      variant="interactive"
      padding="none"
      onClick={onClick}
      className={cn("flex flex-col justify-between text-left overflow-hidden", className)}
    >
      {/* Optional Featured Media Image */}
      {achievement.imageUrl && (
        <div className="relative w-full h-44 overflow-hidden bg-slate-900/60">
          <Image
            src={achievement.imageUrl}
            alt={achievement.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-transparent to-transparent opacity-80" />
        </div>
      )}

      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2">
            {getAchievementBadge(achievement.category)}
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(achievement.achievementDate)}</span>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-base font-bold text-[var(--text-primary)] tracking-tight line-clamp-2 hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
            {achievement.title}
          </h4>

          {achievement.organization && (
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 light:text-blue-700 font-medium">
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{achievement.organization}</span>
            </div>
          )}

          {/* Description Excerpt */}
          {achievement.description && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {achievement.description}
            </p>
          )}
        </div>

        {/* Students footer */}
        {students.length > 0 && (
          <div className="pt-3 border-t border-[var(--border-color)]/70 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              {students.map((s) => s.student.name).join(", ")}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
