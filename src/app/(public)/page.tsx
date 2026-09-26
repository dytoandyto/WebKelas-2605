import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  Users,
  Trophy,
  Megaphone,
  Image as ImageIcon,
  ArrowRight,
  Clock,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  Star,
} from "lucide-react";
import { getHomeData } from "@/lib/data";
import { formatDate, getRelativeDeadline, cn } from "@/lib/utils";
import { TaskStatus, AchievementCategory } from "@prisma/client";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to ClassHub — your digital class hub for schedules, tasks, achievements, and more.",
};

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

const DAY_DISPLAY: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

export default async function HomePage() {
  const data = await getHomeData();
  const {
    stats,
    upcomingTasks,
    todaySchedules,
    latestAnnouncements,
    latestAchievements,
    featuredStudents,
    galleryPreview,
    settings,
  } = data;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero-gradient text-white py-20 px-4 relative overflow-hidden">
        {/* Decorative blobs */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #818cf8, transparent)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 text-indigo-100">
              <Zap size={13} className="text-amber-300" />
              Academic Year {settings.academicYear}
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {settings.className}
            </h1>
            {settings.classDescription && (
              <p className="text-lg text-indigo-100 leading-relaxed mb-8 max-w-2xl">
                {settings.classDescription}
              </p>
            )}
            {settings.classMotto && (
              <p className="text-indigo-200 italic text-base mb-8">
                &ldquo;{settings.classMotto}&rdquo;
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link href="/schedule" className="btn btn-lg bg-white text-brand-700 hover:bg-white/90 font-semibold">
                <Calendar size={16} />
                View Schedule
              </Link>
              <Link href="/tasks" className="btn btn-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 font-semibold">
                <CheckSquare size={16} />
                View Tasks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Students", value: stats.studentsCount, color: "text-brand-600", bg: "bg-brand-50" },
              { icon: Trophy, label: "Achievements", value: stats.achievementsCount, color: "text-amber-600", bg: "bg-amber-50" },
              { icon: BookOpen, label: "Subjects", value: stats.subjectsCount, color: "text-purple-600", bg: "bg-purple-50" },
              { icon: CheckSquare, label: "Active Tasks", value: stats.tasksCount, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", stat.bg)}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* ── TODAY'S SCHEDULE & UPCOMING TASKS ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <Calendar size={20} className="text-brand-600" />
                  Today&apos;s Classes
                </h2>
                <p className="section-subtitle text-sm">
                  {DAY_DISPLAY[data.todayDayOfWeek] || data.todayDayOfWeek}, {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </p>
              </div>
              <Link href="/schedule" className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1">
                Full schedule <ArrowRight size={13} />
              </Link>
            </div>

            {todaySchedules.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="text-slate-400" size={22} />
                </div>
                <p className="text-slate-500 text-sm">No classes scheduled for today</p>
                <p className="text-slate-400 text-xs mt-1">Enjoy your free day! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map((sch: any) => (
                  <div key={sch.id} className="card p-4 card-interactive">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                        <BookOpen className="text-white" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="badge badge-blue">{sch.subject?.code}</span>
                        </div>
                        <p className="font-semibold text-slate-900 mt-1 truncate">{sch.subject?.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {sch.startTime} – {sch.endTime}
                          </span>
                          <span className="truncate">{sch.room}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <CheckSquare size={20} className="text-brand-600" />
                  Upcoming Tasks
                </h2>
                <p className="section-subtitle text-sm">Nearest deadlines</p>
              </div>
              <Link href="/tasks" className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1">
                All tasks <ArrowRight size={13} />
              </Link>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="text-emerald-500" size={22} />
                </div>
                <p className="text-slate-500 text-sm">All caught up!</p>
                <p className="text-slate-400 text-xs mt-1">No upcoming tasks right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task: any) => {
                  const rel = getRelativeDeadline(task.deadline);
                  const statusColor = rel.isOverdue
                    ? "badge-red"
                    : rel.isDueSoon
                    ? "badge-amber"
                    : "badge-blue";
                  return (
                    <div key={task.id} className="card p-4 card-interactive">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            rel.isOverdue ? "bg-red-50" : rel.isDueSoon ? "bg-amber-50" : "bg-brand-50"
                          )}
                        >
                          {rel.isOverdue ? (
                            <AlertCircle size={16} className="text-red-500" />
                          ) : (
                            <Clock
                              size={16}
                              className={rel.isDueSoon ? "text-amber-500" : "text-brand-600"}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="badge badge-gray">{task.subject?.code}</span>
                            <span
                              className={cn(
                                "badge",
                                task.priority === "HIGH"
                                  ? "badge-red"
                                  : task.priority === "MEDIUM"
                                  ? "badge-amber"
                                  : "badge-gray"
                              )}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 mt-1 truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("badge text-xs", statusColor)}>{rel.text}</span>
                            <span className="text-xs text-slate-400">{formatDate(task.deadline)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── LATEST ANNOUNCEMENTS ──────────────────────── */}
        {latestAnnouncements.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <Megaphone size={20} className="text-brand-600" />
                  Latest Announcements
                </h2>
              </div>
              <Link href="/announcements" className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1">
                All announcements <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestAnnouncements.map((ann: any) => (
                <Link href={`/announcements`} key={ann.id} className="card p-5 card-interactive block group">
                  {ann.imageUrl && (
                    <div className="h-40 -mx-5 -mt-5 mb-4 rounded-t-xl overflow-hidden bg-slate-100">
                      <img
                        src={ann.imageUrl}
                        alt={ann.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <span className="badge badge-blue mb-2 block w-fit">Announcement</span>
                  <h3 className="font-semibold text-slate-900 leading-snug mb-2 line-clamp-2">{ann.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-3">{ann.content}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>By {ann.creator?.name}</span>
                    <span>&bull;</span>
                    <span>{formatDate(ann.publishedAt || ann.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── ACHIEVEMENTS ─────────────────────────────── */}
        {latestAchievements.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" />
                  Recent Achievements
                </h2>
              </div>
              <Link href="/achievements" className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1">
                All achievements <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestAchievements.map((ach: any) => (
                <div key={ach.id} className="card p-5 card-interactive">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center flex-shrink-0">
                      {ach.badgeIconUrl ? (
                        <img src={ach.badgeIconUrl} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <Trophy size={20} className="text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn("badge mb-1", CATEGORY_COLOR[ach.category as AchievementCategory])}>
                        {CATEGORY_LABEL[ach.category as AchievementCategory]}
                      </span>
                      <h3 className="font-semibold text-slate-900 leading-snug mt-1 line-clamp-2">{ach.title}</h3>
                      {ach.organization && (
                        <p className="text-sm text-slate-500 mt-1 truncate">{ach.organization}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{formatDate(ach.achievementDate)}</p>
                      {ach.students?.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {ach.students.slice(0, 3).map((sa: any) => (
                            <span key={sa.studentId} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                              {sa.student?.name?.split(" ")[0]}
                            </span>
                          ))}
                          {ach.students.length > 3 && (
                            <span className="text-xs text-slate-400">+{ach.students.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── FEATURED STUDENTS ─────────────────────────── */}
        {featuredStudents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <Users size={20} className="text-brand-600" />
                  Featured Students
                </h2>
              </div>
              <Link href="/students" className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1">
                All students <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featuredStudents.map((student: any) => (
                <Link key={student.id} href={`/students/${student.id}`} className="card p-4 card-interactive text-center block group">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center border-2 border-white shadow-md">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {student.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">{student.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{student.major}</p>
                  {student.achievements?.length > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star size={11} className="text-amber-400" />
                      <span className="text-xs text-slate-500">{student.achievements.length} achievement{student.achievements.length !== 1 ? "s" : ""}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── GALLERY PREVIEW ──────────────────────────── */}
        {galleryPreview.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <ImageIcon size={20} className="text-brand-600" />
                  Photo Gallery
                </h2>
              </div>
              <Link href="/gallery" className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {galleryPreview.map((photo: any) => (
                <Link key={photo.id} href="/gallery" className="block group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-200">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 9. ABOUT CLASS PREVIEW ───────────────────── */}
        <section className="card p-8 sm:p-10 border border-slate-200 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-cyan-50/30">
          <div className="max-w-3xl">
            <span className="badge badge-blue mb-3">About Our Cohort</span>
            <h2
              className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {settings.className}
            </h2>
            {settings.institutionName && (
              <p className="text-cyan-700 font-medium text-sm sm:text-base mb-4">
                {settings.institutionName} &bull; Academic Year {settings.academicYear}
              </p>
            )}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              {settings.classDescription ||
                "A community of curious minds, passionate coders, and future engineering leaders dedicated to excellence in software, algorithms, and collaborative innovation."}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/about" className="btn btn-primary">
                <span>Learn More About Us</span>
                <ArrowRight size={14} />
              </Link>
              <Link href="/students" className="btn btn-secondary">
                <span>Meet the Students ({stats.studentsCount})</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
