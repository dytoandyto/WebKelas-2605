"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CheckSquare,
  Users,
  Trophy,
  Megaphone,
  Image as ImageIcon,
  FolderOpen,
  Menu,
  X,
  LogIn,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/students", label: "Students", icon: Users },
  { href: "/achievements", label: "Honors", icon: Trophy },
  { href: "/announcements", label: "News", icon: Megaphone },
  { href: "/gallery", label: "Memories", icon: ImageIcon },
  { href: "/resources", label: "Vault", icon: FolderOpen },
  { href: "/about", label: "About", icon: Info },
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

  return (
    <header className={cn("fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none", className)}>
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Floating Pill Navbar */}
        <nav
          className={cn(
            "w-full pointer-events-auto rounded-full transition-all duration-300",
            "bg-[#081326]/85 backdrop-blur-2xl border border-cyan-500/25",
            "px-4 sm:px-6 py-2.5 flex items-center justify-between",
            "shadow-[0_8px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)]",
            scrolled ? "border-cyan-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.2)]" : ""
          )}
          aria-label="Main navigation"
        >
          {/* Brand Logo & Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-white group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all">
              <div className="w-full h-full rounded-full bg-[#060b17] flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm sm:text-base font-display text-white">
                SI<span className="text-cyan-400">26</span>
              </span>
              <span className="hidden lg:inline text-[11px] font-medium tracking-wider text-cyan-300/70 border-l border-cyan-500/20 pl-2 uppercase font-mono">
                Systems & Data
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
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
                      ? "text-cyan-300 bg-cyan-500/15 shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-400/40"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_6px_#38bdf8]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action: Admin Login CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide",
                "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white",
                "border border-cyan-300/40 shadow-[0_0_15px_rgba(6,182,212,0.35)]",
                "hover:shadow-[0_0_25px_rgba(6,182,212,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              )}
            >
              <LogIn size={13} />
              <span>Admin Portal</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              className="md:hidden p-2 rounded-full text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-colors focus:outline-none"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} className="text-cyan-400" /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileOpen && (
          <div className="w-full mt-2 pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="rounded-2xl bg-[#081326]/95 border border-cyan-500/30 backdrop-blur-2xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.2)]">
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {navLinks.map((link) => {
                  const Icon = link.icon || Sparkles;
                  const isActive =
                    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all",
                        isActive
                          ? "text-cyan-300 bg-cyan-500/20 border border-cyan-400/40"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={14} className={isActive ? "text-cyan-400" : "text-slate-400"} />
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
                <span>Login to Admin Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
