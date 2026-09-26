"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
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
  GraduationCap,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: GraduationCap },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/students", label: "Students", icon: Users },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/resources", label: "Resources", icon: FolderOpen },
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
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-200",
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
            : "bg-white border-b border-slate-200",
          className
        )}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-xl text-slate-900 flex-shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-sm group-hover:shadow-brand transition-shadow">
              <BookOpen className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span
              className="text-gradient font-display hidden sm:block"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}
            >
              ClassHub
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5 overflow-x-auto">
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
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    isActive
                      ? "text-brand-600 bg-brand-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Admin Link */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="btn btn-primary btn-sm"
            >
              <LogIn size={14} />
              Admin
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden btn btn-ghost btn-icon"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-1 mb-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "text-brand-600 bg-brand-50"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={15} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <Link href="/login" className="btn btn-primary w-full">
              <LogIn size={15} />
              Login as Admin
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
