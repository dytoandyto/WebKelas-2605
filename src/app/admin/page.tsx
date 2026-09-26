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
      bg: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Subjects",
      value: stats.subjectsCount,
      href: "/admin/subjects",
      icon: BookOpen,
      bg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      title: "Pending Tasks",
      value: stats.upcomingTasksCount,
      href: "/admin/tasks",
      icon: CheckSquare,
      bg: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "Achievements",
      value: stats.achievementsCount,
      href: "/admin/achievements",
      icon: Trophy,
      bg: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Class Events",
      value: stats.eventsCount,
      href: "/admin/events",
      icon: CalendarDays,
      bg: "bg-cyan-50 text-cyan-600 border-cyan-100",
    },
    {
      title: "Announcements",
      value: stats.announcementsCount,
      href: "/admin/announcements",
      icon: Megaphone,
      bg: "bg-teal-50 text-teal-600 border-teal-100",
    },
    {
      title: "Gallery Photos",
      value: stats.galleryCount,
      href: "/admin/gallery",
      icon: ImageIcon,
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        title="Class Overview"
        description="Monitor assignments, schedules, student achievements, and class announcements in one place."
      >
        <Link href="/admin/tasks" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm">
          <Plus size={16} />
          <span>New Task</span>
        </Link>
      </AdminHeader>

      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="card p-4 card-interactive flex flex-col justify-between border border-slate-200/80 hover:border-brand-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center", card.bg)}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {card.value}
                  </span>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
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
            <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" />
                  <h2 className="text-base font-bold text-slate-900">Upcoming Deadlines</h2>
                </div>
                <Link
                  href="/admin/tasks"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Manage Tasks
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 bg-white">
                {upcomingDeadlines.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No pending tasks right now. Great job!
                  </div>
                ) : (
                  upcomingDeadlines.map((task: any) => {
                    const st = STATUS_BADGE[task.computedStatus as TaskStatus] || STATUS_BADGE.UPCOMING;
                    const pr = PRIORITY_BADGE[task.priority as TaskPriority] || PRIORITY_BADGE.MEDIUM;
                    return (
                      <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={cn("badge text-xs", st.className)}>{st.label}</span>
                            <span className={cn("badge text-xs", pr.className)}>{pr.label}</span>
                            {task.subject && (
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {task.subject.code}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{task.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <Calendar size={12} />
                            Due: {formatDate(task.deadline)} ({getRelativeDeadline(task.deadline).text})
                          </p>
                        </div>
                        <Link
                          href="/admin/tasks"
                          className="btn btn-ghost btn-sm text-xs text-slate-500 hover:text-brand-600"
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
            <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <Megaphone size={18} className="text-teal-600" />
                  <h2 className="text-base font-bold text-slate-900">Latest Announcements</h2>
                </div>
                <Link
                  href="/admin/announcements"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  All Announcements
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 bg-white">
                {recentAnnouncements.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No announcements published yet.
                  </div>
                ) : (
                  recentAnnouncements.map((ann: any) => (
                    <div key={ann.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{ann.title}</h4>
                        <span className={cn("badge text-xs flex-shrink-0", ann.isPublished ? "badge-green" : "badge-gray")}>
                          {ann.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {ann.content}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 text-xs text-slate-400 border-t border-slate-50">
                        <span>{formatDate(ann.createdAt)}</span>
                        <Link href="/admin/announcements" className="text-brand-600 hover:underline">
                          Edit
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
            <div className="card border border-slate-200/80 shadow-xs p-5 bg-white">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-brand-600" />
                Quick Management
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/admin/schedule"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-brand-50/50 hover:border-brand-200 hover:text-brand-600 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Calendar size={15} />
                  <span>Schedule</span>
                </Link>
                <Link
                  href="/admin/tasks"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-brand-50/50 hover:border-brand-200 hover:text-brand-600 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <CheckSquare size={15} />
                  <span>Tasks</span>
                </Link>
                <Link
                  href="/admin/students"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-brand-50/50 hover:border-brand-200 hover:text-brand-600 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Users size={15} />
                  <span>Students</span>
                </Link>
                <Link
                  href="/admin/gallery"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-brand-50/50 hover:border-brand-200 hover:text-brand-600 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <ImageIcon size={15} />
                  <span>Gallery</span>
                </Link>
                <Link
                  href="/admin/events"
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <CalendarDays size={15} />
                  <span>Events</span>
                </Link>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">Recent Achievements</h3>
                </div>
                <Link
                  href="/admin/achievements"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  View
                </Link>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {recentAchievements.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No achievements recorded yet.
                  </div>
                ) : (
                  recentAchievements.map((ach: any) => (
                    <div key={ach.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{ach.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(ach.achievementDate)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit / Activity Feed */}
            <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">System Activity</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100 bg-white max-h-72 overflow-y-auto">
                {recentActivities.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No recent activity logs.
                  </div>
                ) : (
                  recentActivities.map((act: any) => (
                    <div key={act.id} className="p-3 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-800">
                          {act.user?.name || "System"}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {formatDate(act.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{act.details || act.action}</p>
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
