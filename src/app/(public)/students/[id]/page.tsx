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
  User,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/icons";
import { getStudentById } from "@/lib/data";
import { formatDate, cn } from "@/lib/utils";
import { AchievementCategory } from "@prisma/client";
import { ContentContainer } from "@/components/shared";

const CATEGORY_COLOR: Record<AchievementCategory, string> = {
  COMPETITION: "badge-amber",
  VOLUNTEER: "badge-teal",
  ORGANIZATION: "badge-purple",
  ACADEMIC: "badge-blue",
  CREATIVE: "badge-green",
  TECHNOLOGY: "badge-cyan",
  OTHER: "badge-gray",
};

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  COMPETITION: "Kompetisi",
  VOLUNTEER: "Relawan",
  ORGANIZATION: "Organisasi",
  ACADEMIC: "Akademik",
  CREATIVE: "Kreatif",
  TECHNOLOGY: "Teknologi",
  OTHER: "Lainnya",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) return { title: "Mahasiswa Tidak Ditemukan | JS1SI-26-REG-05" };
  return {
    title: `${student.name} | Mahasiswa JS1SI-26-REG-05`,
    description: student.bio || `Profil akademik mahasiswa ${student.name} — ${student.major} Telkom University Jakarta.`,
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
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        {/* Back Link */}
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)] hover:underline mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Direktori Mahasiswa</span>
        </Link>

        {/* Profile Card */}
        <div className="card rounded-3xl overflow-hidden mb-8 shadow-md">
          {/* Banner */}
          <div className="h-40 bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-800 relative">
            <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
            <div className="absolute -bottom-12 left-6 sm:left-8">
              <div className="w-24 h-24 rounded-2xl border-4 border-[var(--bg-surface)] shadow-lg overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-extrabold text-3xl font-display">
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
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-display tracking-tight">
                  {student.name}
                </h1>
                {student.studentNumber && (
                  <p className="font-mono text-[var(--primary)] text-sm mt-0.5 font-bold">
                    NIM: {student.studentNumber}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                    {student.major}
                  </span>
                  {(student as any).classRole && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                      {(student as any).classRole}
                    </span>
                  )}
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {student.githubUrl && (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] text-xs font-semibold transition-colors"
                    aria-label="GitHub"
                  >
                    <GithubIcon size={14} />
                    <span>GitHub</span>
                  </a>
                )}
                {student.linkedinUrl && (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] text-xs font-semibold transition-colors"
                    aria-label="LinkedIn"
                  >
                    <LinkedinIcon size={14} />
                    <span>LinkedIn</span>
                  </a>
                )}
                {student.portfolioUrl && (
                  <a
                    href={student.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] text-[var(--primary)] hover:underline text-xs font-semibold transition-colors"
                    aria-label="Portfolio"
                  >
                    <Globe size={14} />
                    <span>Portfolio</span>
                  </a>
                )}
                {(student as any).instagramUrl && (
                  <a
                    href={(student as any).instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] text-pink-500 hover:text-pink-600 hover:border-pink-500 text-xs font-semibold transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon size={14} />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>

            {/* Bio / Dream / Motivation */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {student.bio && (
                <div className="sm:col-span-3 p-5 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={15} className="text-[var(--primary)]" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                      // Tentang Mahasiswa
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{student.bio}</p>
                </div>
              )}
              {student.dream && (
                <div className="p-4 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={15} className="text-amber-500" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                      Cita-Cita &amp; Visi
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{student.dream}</p>
                </div>
              )}
              {student.motivation && (
                <div className="p-4 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={15} className="text-rose-500" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
                      Motivasi Belajar
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{student.motivation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        {(student as any).achievements?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] font-display flex items-center gap-2.5">
              <Trophy size={20} className="text-amber-500" />
              <span>Prestasi &amp; Pencapaian ({(student as any).achievements.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(student as any).achievements.map((sa: any) => (
                <div
                  key={sa.achievementId || sa.achievement?.id}
                  className="card p-5 hover:border-[var(--primary)] transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-500">
                      {sa.achievement?.badgeIconUrl ? (
                        <img src={sa.achievement.badgeIconUrl} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <Trophy size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase", CATEGORY_COLOR[(sa.achievement?.category || "OTHER") as AchievementCategory])}>
                          {CATEGORY_LABEL[(sa.achievement?.category || "OTHER") as AchievementCategory]}
                        </span>
                      </div>
                      <h3 className="font-bold text-[var(--text-primary)] text-sm sm:text-base leading-snug">
                        {sa.achievement?.title}
                      </h3>
                      {sa.achievement?.description && (
                        <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">
                          {sa.achievement.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2.5 text-xs text-[var(--text-muted)] font-mono">
                        {sa.achievement?.organization && (
                          <span className="text-[var(--primary)]">{sa.achievement.organization}</span>
                        )}
                        {sa.achievement?.achievementDate && (
                          <span>{formatDate(sa.achievement.achievementDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ContentContainer>
    </div>
  );
}
