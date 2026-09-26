import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  Trophy,
  Lightbulb,
  Heart,
  BookOpen,
  Star,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { getStudentById } from "@/lib/data";
import { formatDate, cn } from "@/lib/utils";
import { AchievementCategory } from "@prisma/client";

const CATEGORY_COLOR: Record<AchievementCategory, string> = {
  COMPETITION: "badge-amber",
  VOLUNTEER: "badge-teal",
  ORGANIZATION: "badge-purple",
  ACADEMIC: "badge-blue",
  CREATIVE: "badge-green",
  TECHNOLOGY: "badge-blue",
  OTHER: "badge-gray",
};

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  COMPETITION: "Competition",
  VOLUNTEER: "Volunteer",
  ORGANIZATION: "Organization",
  ACADEMIC: "Academic",
  CREATIVE: "Creative",
  TECHNOLOGY: "Technology",
  OTHER: "Other",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) return { title: "Student Not Found" };
  return {
    title: student.name,
    description: student.bio || `Profile of ${student.name} — ${student.major}`,
  };
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  return (
    <div className="cosmic-canvas min-h-screen text-slate-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-white text-sm font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Students Directory
        </Link>

        {/* Profile Card */}
        <div className="cyber-card rounded-3xl overflow-hidden mb-8 bg-[#0a1a2f]/75 border border-cyan-500/25 shadow-cyan-glow">
          {/* Banner */}
          <div className="h-36 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-800 relative">
            <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-2xl border-2 border-cyan-300 shadow-cyan-glow overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-extrabold text-3xl">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 pb-8 px-6 sm:px-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{student.name}</h1>
                {student.studentNumber && (
                  <p className="font-mono text-cyan-300 text-sm mt-0.5">{student.studentNumber}</p>
                )}
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 mt-2.5">
                  {student.major}
                </span>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {student.githubUrl && (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061021] border border-cyan-500/25 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-semibold transition-colors"
                    aria-label="GitHub"
                  >
                    <GithubIcon size={14} />
                    GitHub
                  </a>
                )}
                {student.linkedinUrl && (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061021] border border-cyan-500/25 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-semibold transition-colors"
                    aria-label="LinkedIn"
                  >
                    <LinkedinIcon size={14} />
                    LinkedIn
                  </a>
                )}
                {student.portfolioUrl && (
                  <a
                    href={student.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061021] border border-cyan-500/25 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-semibold transition-colors"
                    aria-label="Portfolio"
                  >
                    <Globe size={14} />
                    Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Bio / Dream / Motivation */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {student.bio && (
                <div className="sm:col-span-3 p-4 rounded-2xl bg-[#061021]/80 border border-cyan-500/15">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={15} className="text-cyan-400" />
                    <span className="text-sm font-bold text-white">About</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{student.bio}</p>
                </div>
              )}
              {student.dream && (
                <div className="p-4 rounded-2xl bg-[#061021]/80 border border-cyan-500/15">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={15} className="text-amber-400" />
                    <span className="text-sm font-bold text-white">Future Goal</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{student.dream}</p>
                </div>
              )}
              {student.motivation && (
                <div className="p-4 rounded-2xl bg-[#061021]/80 border border-cyan-500/15">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={15} className="text-rose-400" />
                    <span className="text-sm font-bold text-white">Core Motivation</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{student.motivation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements */}
        {(student as any).achievements?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              <Trophy size={20} className="text-amber-400" />
              Achievements ({(student as any).achievements.length})
            </h2>
            <div className="space-y-3.5">
              {(student as any).achievements.map((sa: any) => (
                <div
                  key={sa.achievementId || sa.achievement?.id}
                  className="cyber-card p-5 rounded-2xl bg-[#0a1a2f]/70 border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
                      {sa.achievement?.badgeIconUrl ? (
                        <img src={sa.achievement.badgeIconUrl} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <Trophy size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn("badge text-xs", CATEGORY_COLOR[(sa.achievement?.category || "OTHER") as AchievementCategory])}>
                          {CATEGORY_LABEL[(sa.achievement?.category || "OTHER") as AchievementCategory]}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug">{sa.achievement?.title}</h3>
                      {sa.achievement?.description && (
                        <p className="text-slate-300 text-sm mt-1 line-clamp-2">{sa.achievement.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-400">
                        {sa.achievement?.organization && (
                          <span className="text-cyan-300">{sa.achievement.organization}</span>
                        )}
                        {sa.achievement?.achievementDate && (
                          <span>{formatDate(sa.achievement.achievementDate)}</span>
                        )}
                        {sa.achievement?.location && <span>{sa.achievement.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
