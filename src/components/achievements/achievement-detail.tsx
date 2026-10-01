"use client";

import * as React from "react";
import Image from "next/image";
import { Trophy, Calendar, Building, MapPin, Users, Award } from "lucide-react";
import { AchievementData, getAchievementBadge } from "./achievement-card";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export interface AchievementDetailProps {
  achievement: AchievementData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AchievementDetail({
  achievement,
  open,
  onOpenChange,
}: AchievementDetailProps) {
  if (!achievement) return null;
  const students = achievement.students || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {getAchievementBadge(achievement.category)}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(achievement.achievementDate)}</span>
            </div>
          </div>
          <DialogTitle className="text-xl sm:text-2xl leading-snug">
            {achievement.title}
          </DialogTitle>
          {achievement.organization && (
            <DialogDescription className="flex items-center gap-1.5 font-medium text-cyan-400 light:text-blue-700">
              <Building className="w-4 h-4 shrink-0" />
              <span>{achievement.organization}</span>
              {achievement.location && <span>&bull; {achievement.location}</span>}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2 text-left">
          {/* Media Image */}
          {achievement.imageUrl && (
            <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden border border-[var(--border-color)] bg-slate-900/50">
              <Image
                src={achievement.imageUrl}
                alt={achievement.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>
          )}

          {/* Full Description */}
          {achievement.description && (
            <div className="space-y-1.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Deskripsi Prestasi
              </h5>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {achievement.description}
              </div>
            </div>
          )}

          {/* Participants */}
          {students.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 light:text-blue-700 font-mono flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Mahasiswa Berprestasi
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {students.map(({ student }) => (
                  <div
                    key={student.id}
                    className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] flex items-center gap-3"
                  >
                    <Avatar
                      src={student.photoUrl}
                      name={student.name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">
                        {student.major}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
