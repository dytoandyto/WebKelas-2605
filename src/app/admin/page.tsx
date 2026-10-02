import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  BookOpen,
  CheckSquare,
  Trophy,
  Megaphone,
  ImageIcon,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
  Activity,
  UserCheck,
  CalendarDays,
  FileText,
  FileCode,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { getAdminOverviewData } from "@/lib/data";
import { getSession } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/admin-header";
import { NextClassCard } from "@/components/admin/next-class-card";
import { formatDate, cn } from "@/lib/utils";
import { DeadlineBadge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Academic Dashboard | JS1SI-26-REG-05",
  description: "Academic class control hub and learning overview.",
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  const {
    stats,
    upcomingDeadlines,
    recentAchievements,
    recentAnnouncements,
    recentActivities,
    todaySchedules,
    recentMaterials,
    recentDailyNotes,
    settings,
  } = await getAdminOverviewData();

  const st = (settings || {}) as Record<string, string>;
  const classCode = st.classCode || "JS1SI-26-REG-05";
  const semester = st.semester || "Semester Ganjil 2026/2027";
  const institution = st.institutionName || "Telkom University Jakarta";
  const waliDosen = st.waliDosen || "Muhammad Ardiansyah";

  const statCards = [
    {
      title: "Students",
      value: stats.studentsCount,
      href: "/admin/students",
      icon: Users,
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      title: "Subjects",
      value: stats.subjectsCount,
      href: "/admin/schedule",
      icon: BookOpen,
      bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    },
    {
      title: "Pending Tasks",
      value: stats.upcomingTasksCount,
      href: "/admin/tasks",
      icon: CheckSquare,
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      title: "Materials",
      value: (stats as any).materialsCount || 0,
      href: "/admin/materials",
      icon: FileCode,
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Daily Notes",
      value: (stats as any).dailyNotesCount || 0,
      href: "/admin/daily-notes",
      icon: FileText,
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    {
      title: "Achievements",
      value: stats.achievementsCount,
      href: "/admin/achievements",
      icon: Trophy,
      bg: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    },
    {
      title: "Announcements",
      value: stats.announcementsCount,
      href: "/admin/announcements",
      icon: Megaphone,
      bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        title="Academic Class Command Hub"
        description={`${classCode} • ${semester} • ${institution}`}
      >
        <div className="flex items-center gap-2">
          <Link
            href="/admin/daily-notes"
            className="btn btn-secondary btn-sm flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Add Note</span>
          </Link>
          <Link
            href="/admin/tasks"
            className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Create Task</span>
          </Link>
        </div>
      </AdminHeader>

      <div className="space-y-8">
        {/* Welcome Banner & Next Class Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 card p-6 border border-border bg-gradient-to-r from-card via-card to-brand-500/5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/25">
                  {classCode}
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  {semester}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-text-primary">
                Selamat Datang, {session?.name || "Admin Kelas"}
              </h2>
              <p className="text-xs text-text-secondary mt-1.5 max-w-xl">
                Wali Dosen: <span className="font-semibold text-text-primary">{waliDosen}</span> &bull; {institution}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-border text-xs text-text-muted">
              <Link href="/schedule" target="_blank" className="hover:text-brand-500 transition-colors font-medium">
                Public Schedule &rarr;
              </Link>
              <span>&bull;</span>
              <Link href="/tasks" target="_blank" className="hover:text-brand-500 transition-colors font-medium">
                Tasks Planner &rarr;
              </Link>
              <span>&bull;</span>
              <Link href="/materials" target="_blank" className="hover:text-brand-500 transition-colors font-medium">
                Materials Repository &rarr;
              </Link>
              <span>&bull;</span>
              <Link href="/daily-notes" target="_blank" className="hover:text-brand-500 transition-colors font-medium">
                Class Journal &rarr;
              </Link>
            </div>
          </div>

          <NextClassCard
            schedules={todaySchedules as any}
            classCode={classCode}
            semester={semester}
          />
        </div>

        {/* Workspace Initial Setup Progress Card (Sections 15 & 16) */}
        {stats.studentsCount === 0 && (
          <div className="card p-6 border border-brand-500/30 bg-brand-500/5 rounded-2xl shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base font-bold text-text-primary">
                    Welcome to ClassHub — Initial Setup
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Your class workspace is ready. Complete the initial setup to start organizing your class.
                </p>
              </div>
              <Link
                href="/admin/students"
                className="btn btn-primary btn-sm flex items-center gap-1.5 self-start md:self-auto"
              >
                <Plus size={15} />
                <span>+ Add First Student</span>
              </Link>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                Setup Progress
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                  <span>Subjects ({stats.subjectsCount} ready)</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                  <span>Schedule (Active)</span>
                </div>
                <Link
                  href="/admin/students"
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl bg-card border transition-colors font-medium",
                    stats.studentsCount > 0
                      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "border-border hover:border-brand-500/40 text-text-muted hover:text-text-primary"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    stats.studentsCount > 0 ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-text-muted"
                  )}>
                    {stats.studentsCount > 0 ? "✓" : "○"}
                  </span>
                  <span>Students ({stats.studentsCount} added)</span>
                </Link>
                <Link
                  href="/admin/tasks"
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl bg-card border transition-colors font-medium",
                    stats.upcomingTasksCount > 0
                      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "border-border hover:border-brand-500/40 text-text-muted hover:text-text-primary"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    stats.upcomingTasksCount > 0 ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-text-muted"
                  )}>
                    {stats.upcomingTasksCount > 0 ? "✓" : "○"}
                  </span>
                  <span>Tasks ({stats.upcomingTasksCount} added)</span>
                </Link>
                <Link
                  href="/admin/materials"
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl bg-card border transition-colors font-medium",
                    ((stats as any).materialsCount || 0) > 0
                      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "border-border hover:border-brand-500/40 text-text-muted hover:text-text-primary"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    ((stats as any).materialsCount || 0) > 0 ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-text-muted"
                  )}>
                    {((stats as any).materialsCount || 0) > 0 ? "✓" : "○"}
                  </span>
                  <span>Materials ({((stats as any).materialsCount || 0)} uploaded)</span>
                </Link>
                <Link
                  href="/admin/daily-notes"
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl bg-card border transition-colors font-medium",
                    ((stats as any).dailyNotesCount || 0) > 0
                      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "border-border hover:border-brand-500/40 text-text-muted hover:text-text-primary"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    ((stats as any).dailyNotesCount || 0) > 0 ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-text-muted"
                  )}>
                    {((stats as any).dailyNotesCount || 0) > 0 ? "✓" : "○"}
                  </span>
                  <span>Daily Notes ({((stats as any).dailyNotesCount || 0)} recorded)</span>
                </Link>
                <Link
                  href="/admin/achievements"
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl bg-card border transition-colors font-medium",
                    stats.achievementsCount > 0
                      ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "border-border hover:border-brand-500/40 text-text-muted hover:text-text-primary"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    stats.achievementsCount > 0 ? "bg-emerald-500/20 text-emerald-600" : "bg-muted text-text-muted"
                  )}>
                    {stats.achievementsCount > 0 ? "✓" : "○"}
                  </span>
                  <span>Achievements ({stats.achievementsCount} recorded)</span>
                </Link>
                <Link
                  href="/admin/resources"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border hover:border-brand-500/40 text-text-muted hover:text-text-primary transition-colors font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-muted text-text-muted flex items-center justify-center text-xs font-bold shrink-0">
                    ○
                  </span>
                  <span>Campus Resources</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="card p-4 border border-border bg-card hover:border-brand-500/40 hover:shadow-sm flex flex-col justify-between group transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center", card.bg)}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-text-primary group-hover:text-brand-500 font-mono transition-colors">
                    {card.value}
                  </span>
                  <ArrowRight size={13} className="text-text-muted group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column: Tasks, Materials, Notes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tasks with Due Dates */}
            {(() => {
              const now = new Date();
              const overdueTasks = upcomingDeadlines.filter((t: any) => new Date(t.deadline) < now);
              const overdueCount = overdueTasks.length;
              return (
                <div className="card rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-2.5">
                      <Clock size={18} className="text-amber-500" />
                      <h2 className="text-base font-bold text-text-primary">Task Deadlines</h2>
                      {overdueCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          <AlertCircle size={10} />
                          {overdueCount} Overdue
                        </span>
                      )}
                    </div>
                    <Link
                      href="/admin/tasks"
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 transition-colors"
                    >
                      Kelola Tugas
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  <div className="divide-y divide-border">
                    {upcomingDeadlines.length === 0 ? (
                      <div className="p-8 text-center text-text-muted text-sm">
                        Tidak ada tugas aktif saat ini. 🎉
                      </div>
                    ) : (
                      upcomingDeadlines.map((task: any) => {
                        const isOverdue = new Date(task.deadline) < now;
                        const isToday = (() => {
                          const d = new Date(task.deadline);
                          return d.toDateString() === now.toDateString();
                        })();
                        return (
                          <div
                            key={task.id}
                            className={`p-4 transition-colors flex items-center justify-between gap-4 ${
                              isOverdue
                                ? "bg-red-50/60 hover:bg-red-50 border-l-2 border-red-400"
                                : isToday
                                ? "bg-amber-50/50 hover:bg-amber-50/80 border-l-2 border-amber-400"
                                : "hover:bg-slate-50/80 dark:hover:bg-white/[0.025]"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <DeadlineBadge deadline={task.deadline} />
                                {task.subject && (
                                  <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/20 px-2 py-0.5 rounded">
                                    {task.subject.code}
                                  </span>
                                )}
                                {isOverdue && (
                                  <span className="text-[10px] font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <AlertCircle size={9} />
                                    Sudah Lewat
                                  </span>
                                )}
                              </div>
                              <h4 className={`text-sm font-bold truncate ${isOverdue ? "text-red-800 dark:text-red-300" : "text-slate-900 dark:text-white"}`}>
                                {task.title}
                              </h4>
                              <p className={`text-xs mt-1 flex items-center gap-1.5 font-mono ${isOverdue ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
                                <Calendar size={12} className={isOverdue ? "text-red-400" : "text-blue-500 dark:text-cyan-400"} />
                                <span>Deadline: {formatDate(task.deadline)}</span>
                              </p>
                            </div>
                            <Link
                              href="/admin/tasks"
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
                                isOverdue
                                  ? "text-red-700 bg-red-100 hover:bg-red-200 border-red-200"
                                  : "text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              Kelola
                            </Link>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()}


            {/* Recent Daily Notes (Class Journal) */}
            <div className="card rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-purple-500" />
                  <h2 className="text-base font-bold text-text-primary">Recent Daily Notes (Class Journal)</h2>
                </div>
                <Link
                  href="/admin/daily-notes"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 transition-colors"
                >
                  View All Journal Notes
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-border">
                {recentDailyNotes.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">
                    No daily notes written yet. Click &quot;+ Add Note&quot; to write today&apos;s summary.
                  </div>
                ) : (
                  recentDailyNotes.map((note: any) => (
                    <div key={note.id} className="p-4 hover:bg-surface/50 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                            {formatDate(note.date)}
                          </span>
                          {note.subject && (
                            <span className="text-[11px] font-semibold text-text-muted">
                              {note.subject.name}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/daily-notes/${note.id}`}
                          target="_blank"
                          className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          Read &rarr;
                        </Link>
                      </div>
                      <h4 className="text-sm font-bold text-text-primary">{note.title}</h4>
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                        {note.summary}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Learning Materials */}
            <div className="card rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
                <div className="flex items-center gap-2.5">
                  <FileCode size={18} className="text-emerald-500" />
                  <h2 className="text-base font-bold text-text-primary">Latest Course Materials</h2>
                </div>
                <Link
                  href="/admin/materials"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 transition-colors"
                >
                  Manage Materials
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-border">
                {recentMaterials.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">
                    No course materials uploaded yet.
                  </div>
                ) : (
                  recentMaterials.map((mat: any) => (
                    <div key={mat.id} className="p-4 hover:bg-surface/50 transition-colors flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {mat.type}
                          </span>
                          {mat.subject && (
                            <span className="text-[11px] text-text-muted font-medium">
                              {mat.subject.code} &bull; {mat.subject.name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-text-primary truncate">{mat.title}</h4>
                      </div>
                      <Link
                        href={`/materials/${mat.id}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-primary bg-surface hover:bg-surface-elevated border border-border transition-colors shrink-0"
                      >
                        Open
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Links & Recent Activity */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="card rounded-xl border border-border p-5 bg-card shadow-xs">
              <h3 className="text-sm font-bold text-text-primary mb-3.5 flex items-center gap-2">
                <Activity size={16} className="text-brand-500" />
                Quick Management
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/admin/schedule"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
                >
                  <Calendar size={15} className="text-brand-500" />
                  <span>Schedule</span>
                </Link>
                <Link
                  href="/admin/tasks"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
                >
                  <CheckSquare size={15} className="text-amber-500" />
                  <span>Tasks</span>
                </Link>
                <Link
                  href="/admin/materials"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
                >
                  <FileCode size={15} className="text-emerald-500" />
                  <span>Materials</span>
                </Link>
                <Link
                  href="/admin/daily-notes"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
                >
                  <FileText size={15} className="text-purple-500" />
                  <span>Daily Notes</span>
                </Link>
                <Link
                  href="/admin/students"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
                >
                  <Users size={15} className="text-blue-500" />
                  <span>Students</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
                >
                  <GraduationCap size={15} className="text-cyan-500" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="card rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-surface">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-text-primary">Recent Class Honors</h3>
                </div>
                <Link
                  href="/admin/achievements"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline transition-colors"
                >
                  View
                </Link>
              </div>
              <div className="divide-y divide-border">
                {recentAchievements.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-xs">
                    No achievements recorded yet.
                  </div>
                ) : (
                  recentAchievements.map((ach: any) => (
                    <div key={ach.id} className="p-3.5 hover:bg-surface/50 transition-colors">
                      <p className="text-xs font-bold text-text-primary line-clamp-1">{ach.title}</p>
                      <p className="text-[11px] text-brand-600 dark:text-brand-400 font-mono mt-0.5">{formatDate(ach.achievementDate)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit / Activity Telemetry */}
            <div className="card rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-surface">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-brand-500" />
                  <h3 className="text-sm font-bold text-text-primary">Activity Audit Log</h3>
                </div>
                <Link
                  href="/admin/logs"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline transition-colors"
                >
                  Full Log
                </Link>
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {recentActivities.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-xs">
                    No recent activity logs.
                  </div>
                ) : (
                  recentActivities.map((act: any) => (
                    <div key={act.id} className="p-3 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-text-primary">
                          {act.user?.name || "System"}
                        </span>
                        <span className="text-text-muted text-[10px] font-mono">
                          {formatDate(act.createdAt)}
                        </span>
                      </div>
                      <p className="text-text-secondary line-clamp-2">{act.details || act.action}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
