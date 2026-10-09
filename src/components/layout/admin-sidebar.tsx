"use client";

import * as React from "react";
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
  Settings,
  LogOut,
  CalendarDays,
  History,
  BookMarked,
  FileText,
  UserCog,
  Component,
  X,
  Layers,
  Info,
  LayoutTemplate,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/auth/session";
import { hasPermission, Permission } from "@/lib/permissions";
import { Avatar } from "@/components/ui/avatar";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  permission?: Permission;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
        permission: "VIEW_ADMIN",
      },
    ],
  },
  {
    label: "ACADEMIC",
    items: [
      {
        href: "/admin/schedule",
        label: "Schedule",
        icon: Calendar,
        permission: "SCHEDULES_MANAGE",
      },
      {
        href: "/admin/subjects",
        label: "Subjects",
        icon: BookOpen,
        permission: "SUBJECTS_MANAGE",
      },
      {
        href: "/admin/tasks",
        label: "Tasks & Deadlines",
        icon: CheckSquare,
        permission: "TASKS_MANAGE",
      },
      {
        href: "/admin/materials",
        label: "Materials",
        icon: BookMarked,
        permission: "MATERIALS_MANAGE",
      },
      {
        href: "/admin/daily-notes",
        label: "Daily Notes",
        icon: FileText,
        permission: "DAILY_NOTES_MANAGE",
      },
      {
        href: "/admin/resources",
        label: "Campus Resources",
        icon: Layers,
        permission: "RESOURCES_MANAGE",
      },
    ],
  },
  {
    label: "WEBSITE",
    items: [
      {
        href: "/admin/homepage-builder",
        label: "Homepage Builder",
        icon: LayoutTemplate,
        permission: "SETTINGS_MANAGE",
      },
      {
        href: "/admin/about",
        label: "Halaman Tentang",
        icon: Info,
        permission: "SETTINGS_MANAGE",
      },
    ],
  },
  {
    label: "CLASS",
    items: [
      {
        href: "/admin/students",
        label: "Students",
        icon: Users,
        permission: "STUDENTS_MANAGE",
      },
      {
        href: "/admin/achievements",
        label: "Achievements",
        icon: Trophy,
        permission: "ACHIEVEMENTS_MANAGE",
      },
      {
        href: "/admin/announcements",
        label: "Announcements",
        icon: Megaphone,
        permission: "ANNOUNCEMENTS_MANAGE",
      },
      {
        href: "/admin/events",
        label: "Events",
        icon: CalendarDays,
        permission: "EVENTS_MANAGE",
      },
      {
        href: "/admin/gallery",
        label: "Gallery",
        icon: ImageIcon,
        permission: "GALLERY_MANAGE",
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        href: "/admin/profile",
        label: "Profil & Keamanan",
        icon: KeyRound,
        permission: "VIEW_ADMIN",
      },
      {
        href: "/admin/users",
        label: "Users & Access",
        icon: UserCog,
        permission: "USERS_MANAGE",
      },
      {
        href: "/admin/logs",
        label: "Activity Logs",
        icon: History,
        permission: "LOGS_VIEW",
      },
      {
        href: "/admin/components",
        label: "Design System",
        icon: Component,
        permission: "VIEW_ADMIN",
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: Settings,
        permission: "SETTINGS_MANAGE",
      },
    ],
  },
];

export interface AdminSidebarProps {
  user: SessionUser;
  onClose?: () => void;
  className?: string;
}

export function AdminSidebar({ user, onClose, className }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await logoutAction();
  }

  const roleLabel =
    user.role === "ADMIN"
      ? "Admin"
      : user.role === "CLASS_ADMIN"
      ? "Class Admin"
      : user.role === "LECTURER"
      ? "Wali Dosen"
      : "Assistant";

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white dark:bg-[#0c1427] border-r border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 select-none",
        className
      )}
    >
      {/* Brand & Role Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-2.5">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
              CH
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-900 dark:text-white tracking-tight truncate leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                ClassHub
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none">
                  JS1SI-26-REG-05
                </span>
                <span className="text-slate-300 dark:text-slate-600 text-[9px] leading-none">•</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide border leading-none shrink-0 uppercase font-mono",
                    user.role === "ADMIN" &&
                      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
                    user.role === "CLASS_ADMIN" &&
                      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
                    user.role === "LECTURER" &&
                      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30",
                    user.role === "ASSISTANT" &&
                      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
                  )}
                >
                  {roleLabel}
                </span>
              </div>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden cursor-pointer transition-colors shrink-0"
              aria-label="Tutup navigasi"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (
              user.role === "CLASS_ADMIN" &&
              (item.href === "/admin/homepage-builder" || item.href === "/admin/about")
            ) {
              return true;
            }
            return item.permission ? hasPermission(user.role, item.permission) : true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-colors duration-150",
                        active
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-600/15 dark:text-blue-400 font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-blue-600 dark:before:bg-blue-500"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5"
                      )}
                    >
                      <Icon
                        size={16}
                        className={cn(
                          active
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimalist User Footer */}
      {/* <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#090f1d]">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 leading-tight">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user.email || roleLabel}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar dari Akun"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
            aria-label="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div> */}
    </aside>
  );
}
