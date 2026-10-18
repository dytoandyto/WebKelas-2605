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
  { href: "/articles", label: "Artikel", icon: BookOpen },
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
    <header className={cn("fixed top-3 sm:top-5 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pointer-events-none", className)}>
      <div className="max-w-[1680px] w-full mx-auto flex flex-col items-center">
        {/* Floating Pill Navbar */}
        <nav
          className={cn(
            "w-full pointer-events-auto rounded-full transition-all duration-200",
            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800",
            "px-4 sm:px-5 py-2.5 flex items-center justify-between",
            "shadow-sm",
            scrolled ? "shadow-md border-slate-300 dark:border-slate-700" : ""
          )}
          aria-label="Main navigation"
        >
          {/* Brand Logo & Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              05
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm sm:text-base font-display text-slate-900 dark:text-white">
                SI <span className="text-blue-600 dark:text-blue-400">• 26-05</span>
              </span>
              <span className="hidden xl:inline text-[11px] font-medium tracking-wider text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2 uppercase font-mono">
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
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors relative",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={handleOpenSearch}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Search"
              aria-label="Pencarian (Ctrl+K)"
            >
              <Search size={13} className="text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Cari</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono rounded bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                ⌘K
              </kbd>
            </button>

            <ThemeSwitcher variant="pill" />

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogIn size={13} />
              <span>Masuk</span>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden cursor-pointer"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="w-full mt-2 pointer-events-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xl lg:hidden animate-in fade-in-0 duration-200">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {navLinks.map((link) => {
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
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <LogIn size={14} />
                <span>Masuk Portal Admin</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
