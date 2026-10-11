import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Calendar, Building, MapPin, Users, Award, ExternalLink } from "lucide-react";
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
import { formatDate, formatPhotoUrl } from "@/lib/utils";

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
          <DialogTitle className="text-xl sm:text-2xl leading-snug flex items-center gap-2.5">
            {achievement.badgeIconUrl && (
              <span className="text-2xl shrink-0 leading-none">
                {achievement.badgeIconUrl.startsWith("http") || achievement.badgeIconUrl.startsWith("/") || achievement.badgeIconUrl.startsWith("data:") ? (
                  <img src={formatPhotoUrl(achievement.badgeIconUrl)} alt="Badge" className="w-7 h-7 object-contain inline" />
                ) : (
                  achievement.badgeIconUrl
                )}
              </span>
            )}
            <span>{achievement.title}</span>
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
                src={formatPhotoUrl(achievement.imageUrl)}
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
                  <Link
                    key={student.id}
                    href={`/students/${student.id}`}
                    onClick={() => onOpenChange(false)}
                    className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-cyan-400/50 light:hover:border-blue-400 transition-colors flex items-center gap-3 group"
                  >
                    <Avatar
                      src={student.photoUrl}
                      name={student.name}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-cyan-400 light:group-hover:text-blue-600 truncate transition-colors">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">
                        {student.major}
                      </div>
                    </div>
                    <ExternalLink size={13} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
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
