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
  ChevronRight,
  CalendarDays,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/auth/session";
import { hasPermission, Permission } from "@/lib/permissions";

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
      { href: "/admin/resources", label: "Resources", icon: FolderOpen, permission: "RESOURCES_MANAGE" },
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
    <aside className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-sm">
            <GraduationCap className="text-white" size={17} />
          </div>
          <span
            className="font-extrabold text-slate-900 text-lg"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            ClassHub
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden btn btn-ghost btn-icon"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
        {navGroups.map((group) => {
          const permittedItems = group.items.filter(
            (item) => !item.permission || hasPermission(user.role, item.permission)
          );
          if (permittedItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                {group.label}
              </p>
              {permittedItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("sidebar-link", active && "active")}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={13} className="text-brand-400" />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="border-t border-slate-200 p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.role.replace("_", " ")}</p>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="sidebar-link text-sm mb-1"
        >
          <GraduationCap size={14} />
          View Site
        </Link>
        <form action={handleLogout}>
          <button
            type="submit"
            className="sidebar-link text-sm w-full text-left text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </form>
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-[260px] bg-white border-r border-slate-200 z-30">
        <AdminSidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute top-0 left-0 h-full w-72 bg-white border-r border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn btn-ghost btn-icon"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <GraduationCap className="text-white" size={14} />
            </div>
            <span className="font-bold text-slate-900">ClassHub Admin</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
