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
  { href: "/", label: "Beranda" },
  { href: "/schedule", label: "Jadwal", icon: Calendar },
  { href: "/subjects", label: "Mata Kuliah", icon: BookOpen, hasDropdown: true },
  { href: "/tasks", label: "Tugas", icon: CheckSquare },
  { href: "/articles", label: "Artikel", icon: BookOpen },
  { href: "/daily-notes", label: "Catatan", icon: FileText },
  { href: "/students", label: "Mahasiswa", icon: Users },
  { href: "/achievements", label: "Prestasi", icon: Trophy },
  { href: "/about", label: "Tentang", icon: Info },
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

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const subjectsDropdownRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSubjectsOpen(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSubjectsOpen(false);
    }, 250);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        subjectsDropdownRef.current &&
        !subjectsDropdownRef.current.contains(event.target as Node)
      ) {
        setSubjectsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setSubjectsOpen(false);
  }

  const handleOpenSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-global-search"));
    }
  };

  return (
    <header
      className={cn(
        "fixed top-3 sm:top-5 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pointer-events-none",
        className
      )}
    >
      <div className="max-w-[1680px] w-full mx-auto flex flex-col items-center">
        {/* Floating Pill Navbar */}
        <nav
          className={cn(
            "w-full pointer-events-auto rounded-full transition-all duration-200",
            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800",
            "px-4 sm:px-5 py-2.5 flex items-center justify-between",
            "shadow-sm",
            scrolled ? "shadow-md border-slate-300 dark:border-slate-700" : ""
          )}
          aria-label="Navigasi utama"
        >
          {/* Brand Logo & Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              05
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-sm font-display">
                  {classCode}
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block tracking-wider uppercase">
                SI Tel-U JKT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
            {baseNavLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              if (link.hasDropdown && subjects && subjects.length > 0) {
                return (
                  <div
                    key={link.href}
                    ref={subjectsDropdownRef}
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        if (!subjectsOpen) {
                          e.preventDefault();
                          setSubjectsOpen(true);
                        }
                      }}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors relative inline-flex items-center gap-1.5 cursor-pointer",
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/60",
                        subjectsOpen && !isActive && "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      )}
                      aria-expanded={subjectsOpen}
                      aria-haspopup="true"
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        size={12}
                        className={cn(
                          "transition-transform duration-200 opacity-70 shrink-0",
                          subjectsOpen && "rotate-180"
                        )}
                      />
                    </Link>

                    {/* Subjects Dropdown Menu with bridge padding */}
                    {subjectsOpen && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-80 z-50"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
                          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                            <span>Mata Kuliah Kurikulum</span>
                            <span>{subjects.length} Matkul</span>
                          </div>
                          <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                            {subjects.map((s) => (
                              <Link
                                key={s.id}
                                href={`/subjects/${s.code}`}
                                onClick={() => setSubjectsOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                              >
                                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shrink-0">
                                  {s.code}
                                </span>
                                <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                  {s.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                          <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                            <Link
                              href="/subjects"
                              onClick={() => setSubjectsOpen(false)}
                              className="block text-center py-1.5 px-3 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            >
                              Lihat Semua Mata Kuliah &rarr;
                            </Link>
                          </div>
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
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors relative",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/60"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search */}
            <button
              type="button"
              onClick={handleOpenSearch}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
              title="Pencarian (Ctrl+K)"
              aria-label="Pencarian (Ctrl+K)"
            >
              <Search size={13} className="text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Cari</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono rounded bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
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
                className="rounded-full text-xs py-1.5 px-3"
                leftIcon={<LogIn size={13} />}
              >
                Masuk
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden cursor-pointer"
              aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileOpen && (
          <div className="w-full mt-2 pointer-events-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xl lg:hidden animate-in fade-in-0 slide-in-from-top-4 duration-200">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleOpenSearch();
              }}
              className="w-full flex items-center justify-between p-2.5 mb-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Cari di Seluruh Kelas...</span>
              </span>
              <kbd className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                ⌘K
              </kbd>
            </button>
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
                      "flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              <div className="mb-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMobileSubjectsOpen(!mobileSubjectsOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
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
                        className="flex items-center gap-2 py-1 px-2 rounded text-[11px] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400">
                          {s.code}
                        </span>
                        <span className="truncate">{s.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
