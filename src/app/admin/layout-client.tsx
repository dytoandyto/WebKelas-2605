"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

interface AdminLayoutClientProps {
  user: SessionUser;
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040813] text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-[260px] bg-white dark:bg-[#0c1427] border-r border-slate-200 dark:border-slate-800/80 z-30 shadow-xs">
        <AdminSidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/80 backdrop-blur-xs animate-in fade-in-0 duration-150"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute top-0 left-0 h-full w-72 bg-white dark:bg-[#0c1427] border-r border-slate-200 dark:border-slate-800/80 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#060b17] min-w-0">
        {/* Mobile Header Bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white dark:bg-[#0c1427] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 h-14 text-slate-900 dark:text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                CH
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                ClassHub Admin
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Topbar with Breadcrumbs, Search, Role Pill, and User Menu */}
        <div className="hidden lg:block">
          <AdminTopbar user={user} />
        </div>

        {/* Page Content */}
        <main className="flex-1 bg-slate-50 dark:bg-[#040813] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
