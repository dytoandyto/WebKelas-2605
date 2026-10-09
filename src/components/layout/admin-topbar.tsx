"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  User,
  LogOut,
  Settings,
  Sparkles,
  Command,
  KeyRound,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { logoutAction } from "@/lib/actions/auth";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChangePasswordModal } from "@/components/admin/change-password-modal";

interface AdminTopbarProps {
  user: SessionUser;
  onOpenMobileSidebar?: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; category: string }> = {
  "/admin": { title: "Dashboard Overview", category: "Overview" },
  "/admin/schedule": { title: "Class Timetable", category: "Academic" },
  "/admin/subjects": { title: "Curriculum Subjects", category: "Academic" },
  "/admin/tasks": { title: "Tasks & Assignments", category: "Academic" },
  "/admin/materials": { title: "Course Materials", category: "Academic" },
  "/admin/daily-notes": { title: "Daily Study Journal", category: "Academic" },
  "/admin/students": { title: "Student Roster", category: "Class" },
  "/admin/achievements": { title: "Class Achievements", category: "Class" },
  "/admin/announcements": { title: "Noticeboard Announcements", category: "Class" },
  "/admin/events": { title: "Academic Calendar & Events", category: "Class" },
  "/admin/gallery": { title: "Photo & Media Gallery", category: "Class" },
  "/admin/users": { title: "User & Access Management", category: "System" },
  "/admin/logs": { title: "System Activity Audit", category: "System" },
  "/admin/settings": { title: "Workspace & Class Settings", category: "System" },
  "/admin/profile": { title: "Profil & Keamanan Akun", category: "Account" },
  "/admin/resources": { title: "Campus Academic Resources", category: "Academic" },
  "/admin/components": { title: "Design System Showcase", category: "System" },
};

const ROLE_INFO: Record<string, { label: string; badgeVariant: "cyan" | "blue" | "emerald" | "outline" | "red" }> = {
  ADMIN: { label: "Super Admin", badgeVariant: "red" },
  CLASS_ADMIN: { label: "Class Admin", badgeVariant: "blue" },
  LECTURER: { label: "Manager / Wali Dosen", badgeVariant: "cyan" },
  ASSISTANT: { label: "Teaching Assistant", badgeVariant: "emerald" },
};

export function AdminTopbar({ user, onOpenMobileSidebar }: AdminTopbarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const routeInfo = ROUTE_TITLES[pathname] || {
    title: pathname.split("/").pop()?.replace(/-/g, " ") || "Admin",
    category: "Administration",
  };

  const roleMeta = ROLE_INFO[user.role] || {
    label: user.role || "User",
    badgeVariant: "outline" as const,
  };

  async function handleLogout() {
    await logoutAction();
  }

  return (
    <header className="sticky top-0 z-20 h-15 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0c1427]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Breadcrumbs & Page Context */}
      <div className="flex items-center gap-3 min-w-0">
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Link
            href="/admin"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Admin
          </Link>
          <ChevronRight size={12} className="opacity-40" />
          <span className="text-slate-400 dark:text-slate-500">{routeInfo.category}</span>
          <ChevronRight size={12} className="opacity-40" />
          <span className="text-slate-900 dark:text-white font-semibold truncate">
            {routeInfo.title}
          </span>
        </nav>

        {/* Mobile Page Title */}
        <div className="sm:hidden font-bold text-sm text-slate-900 dark:text-white truncate">
          {routeInfo.title}
        </div>
      </div>

      {/* Right: Actions, Role Badge, Theme Switcher, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Badge Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
          <Shield size={12} className="text-blue-600 dark:text-blue-400" />
          <span>{roleMeta.label}</span>
        </div>

        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title="Buka Website Publik di Tab Baru"
        >
          <span>Web Publik</span>
          <ExternalLink size={12} />
        </Link>

        {/* Theme Switcher */}
        <ThemeSwitcher variant="pill" />

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-4 shadow-xl z-50 text-left animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Notifikasi Sistem
                </span>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                  3 Terkini
                </span>
              </div>
              <div className="space-y-2 mt-3 text-xs">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                  <div className="font-semibold text-blue-900 dark:text-blue-300">
                    Jadwal Perkuliahan Aktif
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Semester Ganjil 2026/2027 telah dimulai untuk JS1SI-26-REG-05.
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Sinkronisasi LMS
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Tautan LMS Telkom University aktif pada seluruh kartu tugas.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            <Avatar name={user.name} size="sm" />
            <span className="hidden xl:inline text-xs font-semibold text-slate-900 dark:text-white max-w-[120px] truncate">
              {user.name}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-3 shadow-xl z-50 text-left animate-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                  {user.email}
                </div>
                <div className="mt-1.5">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {roleMeta.label}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <User size={14} className="text-slate-400" />
                  <span>Profil Akun</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer text-left font-medium"
                >
                  <KeyRound size={14} className="text-blue-500" />
                  <span>Ubah Password</span>
                </button>
                <Link
                  href="/admin/logs"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <Shield size={14} className="text-slate-400" />
                  <span>Activity Logs</span>
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <Settings size={14} className="text-slate-400" />
                    <span>Workspace Settings</span>
                  </Link>
                )}
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                >
                  <LogOut size={14} />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        userEmail={user.email}
        userName={user.name}
      />
    </header>
  );
}
