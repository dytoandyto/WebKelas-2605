"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CheckSquare,
  Users,
  Trophy,
  BookOpen,
  FileText,
  Info,
  Menu,
  X,
  LogIn,
  ChevronDown,
  Sparkles,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Button } from "@/components/ui/button";

export interface NavSubjectItem {
  id: string;
  code: string;
  name: string;
  englishName?: string | null;
  sks?: number | null;
}

const baseNavLinks = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/subjects", label: "Subjects", icon: BookOpen, hasDropdown: true },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/materials", label: "Materials", icon: BookOpen },
  { href: "/daily-notes", label: "Daily Notes", icon: FileText },
  { href: "/students", label: "Students", icon: Users },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/about", label: "About", icon: Info },
];

export interface PublicNavbarProps {
  className?: string;
  classCode?: string;
  subjects?: NavSubjectItem[];
}

export function PublicNavbar({
  className,
  classCode = "JS1SI-26-REG-05",
  subjects = [],
}: PublicNavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [subjectsOpen, setSubjectsOpen] = React.useState(false);
  const [mobileSubjectsOpen, setMobileSubjectsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const handleOpenSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-global-search"));
    }
  };

  return (
    <header
      className={cn(
        "fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Floating Pill Navbar */}
        <nav
          className={cn(
            "w-full pointer-events-auto rounded-full transition-all duration-300",
            "bg-[#081326]/85 backdrop-blur-2xl border border-cyan-500/25",
            "light:bg-white/90 light:border-slate-200 light:shadow-[0_8px_30px_rgba(18,32,44,0.08)]",
            "px-4 sm:px-5 py-2.5 flex items-center justify-between",
            "shadow-[0_8px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)]",
            scrolled
              ? "border-cyan-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.2)] light:border-blue-400/40"
              : ""
          )}
          aria-label="Main navigation"
        >
          {/* Brand Logo & Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all">
              <div className="w-full h-full rounded-full bg-[#060b17] light:bg-white flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-extrabold text-xs">
                  05
                </span>
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-200 light:from-blue-700 light:via-slate-900 light:to-blue-600 text-sm">
                  {classCode}
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
              </div>
              <span className="text-[10px] text-cyan-400/70 light:text-slate-500 font-mono hidden sm:block tracking-wider uppercase">
                Telkom Univ Jkt
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-black/20 light:bg-slate-100/70 p-1 rounded-full border border-white/5 light:border-slate-200">
            {baseNavLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              if (link.hasDropdown && subjects && subjects.length > 0) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setSubjectsOpen(true)}
                    onMouseLeave={() => setSubjectsOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 relative inline-flex items-center gap-1",
                        isActive
                          ? "text-white font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                          : "text-slate-300 hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-white/80"
                      )}
                    >
                      {isActive && (
                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 -z-10" />
                      )}
                      <span>{link.label}</span>
                      <ChevronDown
                        size={12}
                        className={cn(
                          "transition-transform duration-200 opacity-70",
                          subjectsOpen && "rotate-180"
                        )}
                      />
                    </Link>

                    {/* Subjects Dropdown Menu */}
                    {subjectsOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 rounded-2xl bg-[#081326]/95 backdrop-blur-2xl border border-cyan-500/30 p-2.5 shadow-2xl z-50 light:bg-white light:border-slate-200 light:shadow-[0_12px_40px_rgba(18,32,44,0.12)] animate-in fade-in-0 zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 light:text-blue-700 border-b border-[var(--border-color)]/60 mb-1 flex items-center justify-between">
                          <span>Mata Kuliah Kurikulum</span>
                          <span>{subjects.length} Matkul</span>
                        </div>
                        <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                          {subjects.map((s) => (
                            <Link
                              key={s.id}
                              href={`/subjects/${s.code}`}
                              onClick={() => setSubjectsOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left hover:bg-cyan-500/10 light:hover:bg-slate-100 transition-colors group"
                            >
                              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 light:bg-blue-50 light:text-blue-700 light:border-blue-200 shrink-0">
                                {s.code}
                              </span>
                              <span className="font-medium text-[var(--text-primary)] group-hover:text-cyan-300 light:group-hover:text-blue-600 truncate">
                                {s.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                        <div className="pt-2 mt-1 border-t border-[var(--border-color)]/60">
                          <Link
                            href="/subjects"
                            onClick={() => setSubjectsOpen(false)}
                            className="block text-center py-1.5 px-3 rounded-lg text-xs font-semibold text-cyan-400 light:text-blue-600 hover:bg-cyan-500/10 light:hover:bg-blue-50 transition-colors"
                          >
                            Lihat Semua Mata Kuliah &rarr;
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 relative",
                    isActive
                      ? "text-white font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "text-slate-300 hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-white/80"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 -z-10" />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search */}
            <button
              onClick={handleOpenSearch}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/60 light:bg-slate-100 border border-cyan-500/20 light:border-slate-300 text-xs text-slate-400 hover:text-white hover:border-cyan-400/40 transition-all cursor-pointer"
              title="Search (Ctrl+K)"
            >
              <Search size={13} className="text-cyan-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono rounded bg-white/5 text-slate-400 border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Theme Switcher */}
            <ThemeSwitcher variant="pill" />

            {/* Admin Login / Portal */}
            <Link href="/login" className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs py-1.5 px-3 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                leftIcon={<LogIn size={13} />}
              >
                Portal
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-full bg-slate-900/70 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 lg:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileOpen && (
          <div className="w-full mt-2 pointer-events-auto rounded-3xl bg-[#081326]/95 backdrop-blur-2xl border border-cyan-500/30 p-4 shadow-2xl lg:hidden light:bg-white light:border-slate-200 animate-in fade-in-0 slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {baseNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-cyan-500/10 light:text-slate-700 light:hover:bg-slate-100"
                    )}
                  >
                    {Icon && <Icon size={14} className="opacity-80 shrink-0" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Subjects Quick Accordion */}
            {subjects && subjects.length > 0 && (
              <div className="mb-3 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setMobileSubjectsOpen(!mobileSubjectsOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-cyan-300 light:text-blue-700 py-1.5 px-2 rounded-lg hover:bg-cyan-500/10 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>Daftar Mata Kuliah ({subjects.length})</span>
                  </span>
                  <ChevronDown
                    size={13}
                    className={cn("transition-transform", mobileSubjectsOpen && "rotate-180")}
                  />
                </button>

                {mobileSubjectsOpen && (
                  <div className="mt-1 space-y-1 pl-2 max-h-48 overflow-y-auto">
                    {subjects.map((s) => (
                      <Link
                        key={s.id}
                        href={`/subjects/${s.code}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 py-1 px-2 rounded text-[11px] text-slate-300 hover:text-cyan-300 light:text-slate-600 light:hover:text-blue-700"
                      >
                        <span className="font-mono font-bold text-[10px] text-cyan-400 light:text-blue-600">
                          {s.code}
                        </span>
                        <span className="truncate">{s.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full rounded-xl"
                  leftIcon={<LogIn size={14} />}
                >
                  Masuk Portal Admin
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
