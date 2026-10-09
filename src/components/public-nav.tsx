"use client";

import { useState, useEffect } from "react";
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
  Search,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/schedule", label: "Jadwal", icon: Calendar },
  { href: "/subjects", label: "Mata Kuliah", icon: BookOpen },
  { href: "/tasks", label: "Tugas", icon: CheckSquare },
  { href: "/materials", label: "Materi", icon: FileText },
  { href: "/daily-notes", label: "Catatan", icon: Layers },
  { href: "/students", label: "Mahasiswa", icon: Users },
  { href: "/achievements", label: "Prestasi", icon: Trophy },
  { href: "/about", label: "Tentang", icon: Info },
];

interface PublicNavProps {
  className?: string;
}

export function PublicNav({ className }: PublicNavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("open-global-search"));
  };

  return (
    <header className={cn("fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none", className)}>
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Floating Pill Navbar */}
        <nav
          className={cn(
            "w-full pointer-events-auto rounded-full transition-all duration-300",
            "bg-[#081326]/85 backdrop-blur-2xl border border-cyan-500/25",
            "light:bg-white/90 light:border-slate-200 light:shadow-[0_8px_30px_rgba(18,32,44,0.08)]",
            "px-4 sm:px-5 py-2.5 flex items-center justify-between",
            "shadow-[0_8px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)]",
            scrolled ? "border-cyan-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.2)] light:border-blue-400/40" : ""
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
                <Layers className="w-4 h-4 text-cyan-400 light:text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm sm:text-base font-display text-white light:text-slate-900">
                SI <span className="text-cyan-400 light:text-blue-600">• 26-05</span>
              </span>
              <span className="hidden xl:inline text-[11px] font-medium tracking-wider text-cyan-300/80 light:text-slate-600 border-l border-cyan-500/20 light:border-slate-300 pl-2 uppercase font-mono">
                Telkom Univ Jakarta
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "text-cyan-300 bg-cyan-500/15 shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-400/40 light:bg-blue-50 light:text-blue-700 light:border-blue-300"
                      : "text-slate-300 hover:text-white hover:bg-white/5 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-cyan-400 light:bg-blue-600 rounded-full shadow-[0_0_6px_#38bdf8]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action: Search + Theme Switcher + Login CTA */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={handleOpenSearch}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-slate-900/60 light:bg-slate-100 border border-cyan-500/20 light:border-slate-200 text-slate-300 light:text-slate-600 hover:border-cyan-400/50 light:hover:border-blue-400 transition-colors cursor-pointer"
              aria-label="Cari di ruang kelas"
              title="Cari (Ctrl + K)"
            >
              <Search size={13} className="text-cyan-400 light:text-blue-600" />
              <span className="hidden md:inline text-[11px] text-slate-400">Cari</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] bg-slate-800 light:bg-slate-200 rounded border border-slate-700 light:border-slate-300 text-slate-400 light:text-slate-600 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Theme Switcher */}
            <ThemeSwitcher variant="pill" className="hidden sm:inline-flex" />

            {/* Class Portal Button */}
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold tracking-wide",
                "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white",
                "border border-cyan-300/40 shadow-[0_0_15px_rgba(6,182,212,0.35)]",
                "hover:shadow-[0_0_25px_rgba(6,182,212,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              )}
            >
              <LogIn size={13} />
              <span>Portal</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              className="lg:hidden p-2 rounded-full text-slate-300 light:text-slate-700 hover:text-cyan-300 light:hover:text-blue-600 hover:bg-white/5 light:hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} className="text-cyan-400 light:text-blue-600" /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileOpen && (
          <div className="w-full mt-2 pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="rounded-2xl bg-[#081326]/95 light:bg-white/95 border border-cyan-500/30 light:border-slate-200 backdrop-blur-2xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.2)] light:shadow-[0_12px_36px_rgba(18,32,44,0.12)]">
              {/* Quick search and theme switch in mobile */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20 light:border-slate-200">
                <button
                  onClick={handleOpenSearch}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-slate-900/60 light:bg-slate-100 border border-cyan-500/20 light:border-slate-200 text-slate-300 light:text-slate-700 cursor-pointer"
                >
                  <Search size={13} className="text-cyan-400 light:text-blue-600" />
                  <span>Cari teman, tugas, materi...</span>
                </button>
                <ThemeSwitcher variant="pill" />
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all",
                        isActive
                          ? "text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 light:bg-blue-50 light:text-blue-700 light:border-blue-300"
                          : "text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {Icon && <Icon size={14} className={isActive ? "text-cyan-400 light:text-blue-600" : "text-slate-400 light:text-slate-500"} />}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <LogIn size={14} />
                <span>Masuk Portal Kelas</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
