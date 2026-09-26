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
    <aside className="flex flex-col h-full bg-[#060e1d] text-slate-200">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-cyan-500/20 bg-[#040914] flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-cyan-glow border border-cyan-300/40">
            <GraduationCap className="text-white" size={17} />
          </div>
          <div>
            <span
              className="font-black text-white text-base tracking-tight block leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              IS 26 Admin
            </span>
            <span className="text-[10px] font-mono font-semibold text-cyan-400 block tracking-widest uppercase">
              Command Node
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-950/50"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5" aria-label="Admin navigation">
        {navGroups.map((group) => {
          const permittedItems = group.items.filter(
            (item) => !item.permission || hasPermission(user.role, item.permission)
          );
          if (permittedItems.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="text-[11px] font-bold text-cyan-400/80 uppercase tracking-widest mb-1.5 px-3">
                {group.label}
              </p>
              <div className="space-y-1">
                {permittedItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                        active
                          ? "bg-cyan-950/70 text-cyan-300 border-l-2 border-cyan-400 shadow-xs shadow-cyan-500/10"
                          : "text-slate-300 hover:text-white hover:bg-cyan-950/30"
                      )}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon size={16} className={cn("flex-shrink-0", active ? "text-cyan-400" : "text-slate-400")} />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight size={13} className="text-cyan-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="border-t border-cyan-500/20 p-3 bg-[#040914] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-xl bg-[#061021] border border-cyan-500/15">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 shadow-cyan-glow">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-cyan-400 truncate font-mono">{user.role.replace("_", " ")}</p>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-cyan-950/30 transition-colors mb-1"
        >
          <GraduationCap size={14} className="text-cyan-400" />
          <span>View Public Portal</span>
        </Link>
        <form action={handleLogout}>
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold w-full text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
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
    <div className="min-h-screen bg-[#040813] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-[260px] bg-[#060e1d] border-r border-cyan-500/20 z-30 shadow-2xl">
        <AdminSidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute top-0 left-0 h-full w-72 bg-[#060e1d] border-r border-cyan-500/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen bg-[#040813]">
        {/* Top bar (mobile) */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#060e1d] border-b border-cyan-500/20 flex items-center justify-between px-4 h-14 text-white">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-950/40"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <GraduationCap className="text-white" size={14} />
              </div>
              <span className="font-bold text-white text-sm">IS 26 Admin</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-[#040813]">{children}</main>
      </div>
    </div>
  );
}
