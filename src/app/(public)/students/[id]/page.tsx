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
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Students
        </Link>

        {/* Profile Card */}
        <div className="card overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-brand-600 to-purple-600 relative">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 pb-6 px-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
                {student.studentNumber && (
                  <p className="text-slate-500 text-sm">{student.studentNumber}</p>
                )}
                <span className="badge badge-blue mt-2">{student.major}</span>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-2">
                {student.githubUrl && (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
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
                    className="btn btn-secondary btn-sm"
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
                    className="btn btn-secondary btn-sm"
                    aria-label="Portfolio"
                  >
                    <Globe size={14} />
                    Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Bio / Dream / Motivation */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {student.bio && (
                <div className="sm:col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={14} className="text-brand-500" />
                    <span className="text-sm font-semibold text-slate-700">About</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{student.bio}</p>
                </div>
              )}
              {student.dream && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-amber-500" />
                    <span className="text-sm font-semibold text-slate-700">Dream</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{student.dream}</p>
                </div>
              )}
              {student.motivation && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={14} className="text-rose-500" />
                    <span className="text-sm font-semibold text-slate-700">Motivation</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{student.motivation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements */}
        {(student as any).achievements?.length > 0 && (
          <div>
            <h2 className="section-title flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-amber-500" />
              Achievements ({(student as any).achievements.length})
            </h2>
            <div className="space-y-3">
              {(student as any).achievements.map((sa: any) => (
                <div key={sa.achievementId || sa.achievement?.id} className="card p-4 card-interactive">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                      {sa.achievement?.badgeIconUrl ? (
                        <img src={sa.achievement.badgeIconUrl} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <Trophy size={16} className="text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn("badge", CATEGORY_COLOR[(sa.achievement?.category || "OTHER") as AchievementCategory])}>
                          {CATEGORY_LABEL[(sa.achievement?.category || "OTHER") as AchievementCategory]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900">{sa.achievement?.title}</h3>
                      {sa.achievement?.description && (
                        <p className="text-slate-500 text-sm mt-1 line-clamp-2">{sa.achievement.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        {sa.achievement?.organization && <span>{sa.achievement.organization}</span>}
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
