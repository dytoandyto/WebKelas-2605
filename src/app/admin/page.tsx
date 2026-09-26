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
} from "lucide-react";
import { getAdminOverviewData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { formatDate, getRelativeDeadline, cn } from "@/lib/utils";
import { TaskStatus, TaskPriority } from "@prisma/client";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview and class activity management.",
};

const STATUS_BADGE: Record<TaskStatus, { label: string; className: string }> = {
  UPCOMING: { label: "Upcoming", className: "badge-blue" },
  DUE_SOON: { label: "Due Soon", className: "badge-amber" },
  OVERDUE: { label: "Overdue", className: "badge-red" },
  COMPLETED: { label: "Completed", className: "badge-green" },
};

const PRIORITY_BADGE: Record<TaskPriority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "badge-gray" },
  MEDIUM: { label: "Medium", className: "badge-blue" },
  HIGH: { label: "High", className: "badge-red" },
};

export default async function AdminDashboardPage() {
  const {
    stats,
    upcomingDeadlines,
    recentAchievements,
    recentAnnouncements,
    recentActivities,
  } = await getAdminOverviewData();

  const statCards = [
    {
      title: "Students",
      value: stats.studentsCount,
      href: "/admin/students",
      icon: Users,
      bg: "bg-blue-950/60 text-blue-400 border-blue-500/30",
    },
    {
      title: "Subjects",
      value: stats.subjectsCount,
      href: "/admin/subjects",
      icon: BookOpen,
      bg: "bg-indigo-950/60 text-indigo-400 border-indigo-500/30",
    },
    {
      title: "Pending Tasks",
      value: stats.upcomingTasksCount,
      href: "/admin/tasks",
      icon: CheckSquare,
      bg: "bg-amber-950/60 text-amber-400 border-amber-500/30",
    },
    {
      title: "Achievements",
      value: stats.achievementsCount,
      href: "/admin/achievements",
      icon: Trophy,
      bg: "bg-purple-950/60 text-purple-400 border-purple-500/30",
    },
    {
      title: "Class Events",
      value: stats.eventsCount,
      href: "/admin/events",
      icon: CalendarDays,
      bg: "bg-cyan-950/60 text-cyan-400 border-cyan-500/30",
    },
    {
      title: "Announcements",
      value: stats.announcementsCount,
      href: "/admin/announcements",
      icon: Megaphone,
      bg: "bg-teal-950/60 text-teal-400 border-teal-500/30",
    },
    {
      title: "Gallery Photos",
      value: stats.galleryCount,
      href: "/admin/gallery",
      icon: ImageIcon,
      bg: "bg-emerald-950/60 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-[#040813] text-slate-100 pb-16">
      <AdminHeader
        title="Command Node Overview"
        description="Monitor assignments, schedules, student achievements, and class announcements in one place."
      >
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 shadow-cyan-glow transition-all"
        >
          <Plus size={16} />
          <span>New Task</span>
        </Link>
      </AdminHeader>

      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="cyber-card p-4 rounded-2xl bg-[#0a1a2f]/70 border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-cyan-glow flex flex-col justify-between group transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {card.title}
                  </span>
                  <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center", card.bg)}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white group-hover:text-cyan-300 font-mono transition-colors">
                    {card.value}
                  </span>
                  <ArrowRight size={13} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column: Tasks & Announcements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Urgent Tasks & Deadlines */}
            <div className="cyber-card rounded-2xl border border-cyan-500/20 bg-[#0a1a2f]/70 overflow-hidden">
              <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#061021]/80">
                <div className="flex items-center gap-2.5">
                  <Clock size={18} className="text-amber-400" />
                  <h2 className="text-base font-extrabold text-white">Upcoming Deadlines</h2>
                </div>
                <Link
                  href="/admin/tasks"
                  className="text-xs font-bold text-cyan-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  Manage Tasks
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-cyan-500/10 bg-[#0a1a2f]/40">
                {upcomingDeadlines.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No pending tasks right now. Great job!
                  </div>
                ) : (
                  upcomingDeadlines.map((task: any) => {
                    const st = STATUS_BADGE[task.computedStatus as TaskStatus] || STATUS_BADGE.UPCOMING;
                    const pr = PRIORITY_BADGE[task.priority as TaskPriority] || PRIORITY_BADGE.MEDIUM;
                    return (
                      <div key={task.id} className="p-4 hover:bg-[#0e2447]/60 transition-colors flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={cn("badge text-[11px]", st.className)}>{st.label}</span>
                            <span className={cn("badge text-[11px]", pr.className)}>{pr.label}</span>
                            {task.subject && (
                              <span className="text-[11px] font-mono font-bold text-cyan-300 bg-[#061021] border border-cyan-500/20 px-2 py-0.5 rounded">
                                {task.subject.code}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white truncate">{task.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                            <Calendar size={12} className="text-cyan-400" />
                            Due: {formatDate(task.deadline)} ({getRelativeDeadline(task.deadline).text})
                          </p>
                        </div>
                        <Link
                          href="/admin/tasks"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-[#061021] hover:bg-cyan-950/80 border border-cyan-500/20 hover:border-cyan-400 transition-colors flex-shrink-0"
                        >
                          View
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="cyber-card rounded-2xl border border-cyan-500/20 bg-[#0a1a2f]/70 overflow-hidden">
              <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#061021]/80">
                <div className="flex items-center gap-2.5">
                  <Megaphone size={18} className="text-cyan-400" />
                  <h2 className="text-base font-extrabold text-white">Latest Announcements</h2>
                </div>
                <Link
                  href="/admin/announcements"
                  className="text-xs font-bold text-cyan-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  All Bulletins
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-cyan-500/10 bg-[#0a1a2f]/40">
                {recentAnnouncements.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No announcements published yet.
                  </div>
                ) : (
                  recentAnnouncements.map((ann: any) => (
                    <div key={ann.id} className="p-4 hover:bg-[#0e2447]/60 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white truncate">{ann.title}</h4>
                        <span className={cn("badge text-[11px] flex-shrink-0", ann.isPublished ? "badge-green" : "badge-gray")}>
                          {ann.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {ann.content}
                      </p>
                      <div className="flex items-center justify-between mt-2.5 pt-2 text-xs text-slate-400 border-t border-cyan-500/10">
                        <span className="font-mono text-[11px]">{formatDate(ann.createdAt)}</span>
                        <Link href="/admin/announcements" className="text-cyan-400 hover:underline font-semibold">
                          Edit Bulletin
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Links & Recent Activity */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="cyber-card rounded-2xl border border-cyan-500/20 p-5 bg-[#0a1a2f]/70">
              <h3 className="text-sm font-extrabold text-white mb-3.5 flex items-center gap-2">
                <Activity size={16} className="text-cyan-400" />
                Quick Management
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/admin/schedule"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-cyan-500/20 bg-[#061021]/80 hover:bg-cyan-950/60 hover:border-cyan-400/50 hover:text-cyan-300 text-slate-300 text-xs font-semibold transition-all"
                >
                  <Calendar size={15} className="text-cyan-400" />
                  <span>Schedule</span>
                </Link>
                <Link
                  href="/admin/tasks"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-cyan-500/20 bg-[#061021]/80 hover:bg-cyan-950/60 hover:border-cyan-400/50 hover:text-cyan-300 text-slate-300 text-xs font-semibold transition-all"
                >
                  <CheckSquare size={15} className="text-cyan-400" />
                  <span>Tasks</span>
                </Link>
                <Link
                  href="/admin/students"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-cyan-500/20 bg-[#061021]/80 hover:bg-cyan-950/60 hover:border-cyan-400/50 hover:text-cyan-300 text-slate-300 text-xs font-semibold transition-all"
                >
                  <Users size={15} className="text-cyan-400" />
                  <span>Students</span>
                </Link>
                <Link
                  href="/admin/gallery"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-cyan-500/20 bg-[#061021]/80 hover:bg-cyan-950/60 hover:border-cyan-400/50 hover:text-cyan-300 text-slate-300 text-xs font-semibold transition-all"
                >
                  <ImageIcon size={15} className="text-cyan-400" />
                  <span>Gallery</span>
                </Link>
                <Link
                  href="/admin/events"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-cyan-500/20 bg-[#061021]/80 hover:bg-cyan-950/60 hover:border-cyan-400/50 hover:text-cyan-300 text-slate-300 text-xs font-semibold transition-all"
                >
                  <CalendarDays size={15} className="text-cyan-400" />
                  <span>Events</span>
                </Link>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="cyber-card rounded-2xl border border-cyan-500/20 bg-[#0a1a2f]/70 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-cyan-500/20 flex items-center justify-between bg-[#061021]/80">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-400" />
                  <h3 className="text-sm font-extrabold text-white">Recent Honors</h3>
                </div>
                <Link
                  href="/admin/achievements"
                  className="text-xs font-bold text-cyan-400 hover:text-white transition-colors"
                >
                  View
                </Link>
              </div>
              <div className="divide-y divide-cyan-500/10 bg-[#0a1a2f]/40">
                {recentAchievements.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No achievements recorded yet.
                  </div>
                ) : (
                  recentAchievements.map((ach: any) => (
                    <div key={ach.id} className="p-3.5 hover:bg-[#0e2447]/60 transition-colors">
                      <p className="text-xs font-bold text-white line-clamp-1">{ach.title}</p>
                      <p className="text-[11px] text-cyan-300 font-mono mt-0.5">{formatDate(ach.achievementDate)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit / Activity Feed */}
            <div className="cyber-card rounded-2xl border border-cyan-500/20 bg-[#0a1a2f]/70 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-cyan-500/20 flex items-center justify-between bg-[#061021]/80">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-extrabold text-white">System Telemetry</h3>
                </div>
              </div>
              <div className="divide-y divide-cyan-500/10 bg-[#0a1a2f]/40 max-h-72 overflow-y-auto">
                {recentActivities.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No recent activity logs.
                  </div>
                ) : (
                  recentActivities.map((act: any) => (
                    <div key={act.id} className="p-3 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-white">
                          {act.user?.name || "System"}
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono">
                          {formatDate(act.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-300 line-clamp-2">{act.details || act.action}</p>
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
