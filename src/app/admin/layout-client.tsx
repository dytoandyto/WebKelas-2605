"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Trophy,
  Megaphone,
  ImageIcon,
  FolderOpen,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  CalendarDays,
  History,
  BookMarked,
  FileText,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/auth/session";
import { hasPermission, Permission } from "@/lib/permissions";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
  permission?: Permission;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, permission: "VIEW_ADMIN" },
    ],
  },
  {
    label: "Academic",
    items: [
      { href: "/admin/schedule", label: "Schedule", icon: Calendar, permission: "SCHEDULES_MANAGE" },
      { href: "/admin/subjects", label: "Subjects", icon: BookOpen, permission: "SUBJECTS_MANAGE" },
      { href: "/admin/tasks", label: "Tasks", icon: CheckSquare, permission: "TASKS_MANAGE" },
      { href: "/admin/materials", label: "Materials", icon: BookMarked, permission: "MATERIALS_MANAGE" },
      { href: "/admin/daily-notes", label: "Daily Notes", icon: FileText, permission: "DAILY_NOTES_MANAGE" },
    ],
  },
  {
    label: "Class",
    items: [
      { href: "/admin/students", label: "Students", icon: Users, permission: "STUDENTS_MANAGE" },
      { href: "/admin/achievements", label: "Achievements", icon: Trophy, permission: "ACHIEVEMENTS_MANAGE" },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone, permission: "ANNOUNCEMENTS_MANAGE" },
      { href: "/admin/events", label: "Events", icon: CalendarDays, permission: "EVENTS_MANAGE" },
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, permission: "GALLERY_MANAGE" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/users", label: "Users", icon: UserCog, permission: "USERS_MANAGE" },
      { href: "/admin/logs", label: "Activity Logs", icon: History, permission: "LOGS_VIEW" },
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: "SETTINGS_MANAGE" },
    ],
  },
];

interface AdminSidebarProps {
  user: SessionUser;
  onClose?: () => void;
}

function AdminSidebar({ user, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await logoutAction();
  }

  return (
    <aside className="flex flex-col h-full bg-[#060e1d] light:bg-white text-slate-200 light:text-slate-800 transition-colors">
      {/* Logo Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-cyan-500/20 light:border-slate-200 bg-[#040914] light:bg-slate-50 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-cyan-glow border border-cyan-300/40">
            <GraduationCap className="text-white" size={17} />
          </div>
          <div>
            <span className="font-black text-white light:text-slate-900 text-base tracking-tight block leading-tight font-display">
              SI &bull; 26-05 Admin
            </span>
            <span className="text-[10px] font-mono font-semibold text-cyan-400 light:text-blue-600 block tracking-widest uppercase">
              Telkom Univ Jakarta
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.permission || hasPermission(user.role, item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400/80 light:text-blue-600/90 mb-2">
                // {group.label}
              </p>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                          active
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm font-bold"
                            : "text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-cyan-500/10 light:hover:bg-slate-100"
                        )}
                      >
                        <Icon size={16} className={active ? "text-white" : "text-slate-400 light:text-slate-500"} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* User profile & Footer */}
      <div className="p-4 border-t border-cyan-500/20 light:border-slate-200 bg-[#040914]/80 light:bg-slate-50 flex-shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 light:bg-blue-100 flex items-center justify-center text-cyan-300 light:text-blue-700 font-bold text-xs font-mono flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white light:text-slate-900 truncate">{user.name}</p>
              <span className="text-[10px] font-mono text-cyan-400 light:text-blue-600 block uppercase font-bold">
                {user.role}
              </span>
            </div>
          </div>
          <ThemeSwitcher variant="pill" />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-cyan-500/10 light:border-slate-200">
          <Link
            href="/"
            target="_blank"
            className="text-[11px] font-semibold text-cyan-400 light:text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Public Portal &rarr;</span>
          </Link>
          <form action={handleLogout}>
            <button
              type="submit"
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
            >
              <LogOut size={12} />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

interface AdminLayoutClientProps {
  user: SessionUser;
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#040813] light:bg-[#f6f9fc] text-slate-100 light:text-slate-900 flex transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-[260px] bg-[#060e1d] light:bg-white border-r border-cyan-500/20 light:border-slate-200 z-30 shadow-2xl">
        <AdminSidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute top-0 left-0 h-full w-72 bg-[#060e1d] light:bg-white border-r border-cyan-500/20 light:border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen bg-[#040813] light:bg-[#f6f9fc]">
        {/* Top bar (mobile) */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#060e1d] light:bg-white border-b border-cyan-500/20 light:border-slate-200 flex items-center justify-between px-4 h-14 text-white light:text-slate-900 shadow-sm">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-300 light:text-slate-700 hover:text-white hover:bg-cyan-950/40"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <GraduationCap className="text-white" size={14} />
              </div>
              <span className="font-bold text-white light:text-slate-900 text-sm">SI 26-05 Admin</span>
            </div>
          </div>
          <ThemeSwitcher variant="pill" />
        </div>

        {/* Page content */}
        <main className="flex-1 bg-[#040813] light:bg-[#f6f9fc] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
