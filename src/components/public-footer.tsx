import Link from "next/link";
import { Mail, Layers, ArrowUpRight } from "lucide-react";
import { InstagramIcon, DiscordIcon, LinkedinIcon } from "@/components/icons";

interface PublicFooterProps {
  settings?: Record<string, string>;
}

const navSections = [
  {
    title: "Aktivitas Kelas",
    links: [
      { href: "/schedule", label: "Jadwal Kuliah" },
      { href: "/tasks", label: "Tugas & Deadline" },
      { href: "/articles", label: "Artikel Edukasi" },
      { href: "/daily-notes", label: "Catatan Kelas" },
    ],
  },
  {
    title: "Tentang Kelas",
    links: [
      { href: "/students", label: "Teman Satu Kelas" },
      { href: "/achievements", label: "Prestasi Kelas" },
      { href: "/subjects", label: "Mata Kuliah" },
      { href: "/about", label: "Profil Kelas" },
    ],
  },
];

export function PublicFooter({ settings }: PublicFooterProps) {
  const classNameCode = settings?.classCode || "JS1SI-26-REG-05";
  const studyProgram = settings?.studyProgram || "S1 Sistem Informasi";
  const institutionName = settings?.institutionName || "Telkom University Jakarta";
  const academicPeriod = settings?.academicYear || "Semester Ganjil 2026/2027";
  const waliDosen = settings?.waliDosen || "Muhammad Ardiansyah";
  const classMotto = settings?.classMotto || "LEARN. BUILD. GROW. TOGETHER.";

  const instagramUrl = settings?.instagramUrl;

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-200">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Cohort Identity */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                05
              </div>
              <div>
                <span className="text-slate-900 dark:text-white text-lg font-bold font-display tracking-tight block">
                  {classNameCode}
                </span>
                <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide">
                  {studyProgram} &bull; {institutionName}
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md leading-relaxed">
              Ruang digital kelas untuk {classNameCode} — tempat membaca artikel edukasi, memantau tugas dan deadline, serta saling terhubung setiap hari.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300">
                <span>{academicPeriod}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Wali Dosen: <strong className="text-slate-900 dark:text-white">{waliDosen}</strong></span>
              </div>
            </div>

            {classMotto && (
              <p className="text-slate-500 dark:text-slate-400 text-xs font-mono tracking-wider italic pt-1">
                &ldquo;{classMotto}&rdquo;
              </p>
            )}

            {/* Social channels */}
            <div className="flex items-center gap-2.5 pt-2">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          {navSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-slate-900 dark:text-white text-xs font-bold tracking-widest uppercase font-mono">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600 dark:text-blue-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Academic Class Hub &bull; Telkom University Jakarta &bull; {studyProgram}</span>
          </div>
          <span>
            &copy; 2026 {classNameCode} &mdash; Academic Class Hub
          </span>
        </div>
      </div>
    </footer>
  );
}
