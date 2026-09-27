import Link from "next/link";
import { Mail, Layers, Sparkles, ArrowUpRight } from "lucide-react";
import { GithubIcon, InstagramIcon, DiscordIcon, LinkedinIcon } from "@/components/icons";

interface PublicFooterProps {
  settings?: Record<string, string>;
}

const navSections = [
  {
    title: "Academic Hub",
    links: [
      { href: "/schedule", label: "Class Timetable" },
      { href: "/tasks", label: "Assignments & Tasks" },
      { href: "/materials", label: "Learning Materials" },
      { href: "/daily-notes", label: "Daily Class Journal" },
    ],
  },
  {
    title: "Class Directory",
    links: [
      { href: "/students", label: "Student Roster" },
      { href: "/achievements", label: "Class Achievements" },
      { href: "/announcements", label: "Announcements" },
      { href: "/about", label: "About Class & Advisor" },
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

  const githubUrl = settings?.githubUrl;
  const linkedinUrl = settings?.linkedinUrl;
  const instagramUrl = settings?.instagramUrl;
  const discordUrl = settings?.discordUrl;
  const contactEmail = settings?.contactEmail;

  return (
    <footer className="relative bg-[#040813] light:bg-[#f8fafc] text-slate-300 light:text-slate-600 border-t border-cyan-500/20 light:border-slate-200 overflow-hidden mt-auto transition-colors duration-200">
      {/* Ambient background glow */}
      <div
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[250px] rounded-full pointer-events-none opacity-20 light:opacity-5 blur-3xl"
        style={{ background: "radial-gradient(circle, #0284c7 0%, #06b6d4 100%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Cohort Identity */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <div className="w-full h-full rounded-full bg-[#060b17] light:bg-white flex items-center justify-center">
                  <Layers className="w-4.5 h-4.5 text-cyan-400 light:text-blue-600" />
                </div>
              </div>
              <div>
                <span className="text-white light:text-slate-900 text-lg font-extrabold font-display tracking-tight block">
                  {classNameCode}
                </span>
                <span className="text-cyan-400 light:text-blue-600 text-xs font-semibold tracking-wide">
                  {studyProgram} &bull; {institutionName}
                </span>
              </div>
            </div>

            <p className="text-slate-300 light:text-slate-600 text-sm max-w-md leading-relaxed">
              Academic class hub and digital workspace for {classNameCode} — supporting unified task tracking, structured learning material vault, and daily class journaling.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/30 light:border-blue-200 text-xs font-semibold text-cyan-300 light:text-blue-700">
                <Sparkles size={12} className="text-cyan-400 light:text-blue-600" />
                <span>{academicPeriod}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 light:bg-slate-100 border border-slate-700/60 light:border-slate-200 text-xs font-medium text-slate-300 light:text-slate-700">
                <span>Wali Dosen: <strong className="text-white light:text-slate-900">{waliDosen}</strong></span>
              </div>
            </div>

            {classMotto && (
              <p className="text-cyan-200/80 light:text-blue-700/80 text-xs font-mono tracking-wider italic pt-1">
                &ldquo;{classMotto}&rdquo;
              </p>
            )}

            {/* Social channels */}
            <div className="flex items-center gap-2.5 pt-2">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#08152e] light:bg-white hover:bg-cyan-500/20 light:hover:bg-blue-50 border border-cyan-500/25 light:border-slate-200 flex items-center justify-center transition-all text-slate-300 light:text-slate-700 hover:text-cyan-300 light:hover:text-blue-600"
                  aria-label="GitHub"
                >
                  <GithubIcon size={15} />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#08152e] light:bg-white hover:bg-cyan-500/20 light:hover:bg-blue-50 border border-cyan-500/25 light:border-slate-200 flex items-center justify-center transition-all text-slate-300 light:text-slate-700 hover:text-cyan-300 light:hover:text-blue-600"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon size={15} />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#08152e] light:bg-white hover:bg-cyan-500/20 light:hover:bg-blue-50 border border-cyan-500/25 light:border-slate-200 flex items-center justify-center transition-all text-slate-300 light:text-slate-700 hover:text-cyan-300 light:hover:text-blue-600"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={15} />
                </a>
              )}
              {discordUrl && (
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#08152e] light:bg-white hover:bg-cyan-500/20 light:hover:bg-blue-50 border border-cyan-500/25 light:border-slate-200 flex items-center justify-center transition-all text-slate-300 light:text-slate-700 hover:text-cyan-300 light:hover:text-blue-600"
                  aria-label="Discord"
                >
                  <DiscordIcon size={15} />
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="w-9 h-9 rounded-xl bg-[#08152e] light:bg-white hover:bg-cyan-500/20 light:hover:bg-blue-50 border border-cyan-500/25 light:border-slate-200 flex items-center justify-center transition-all text-slate-300 light:text-slate-700 hover:text-cyan-300 light:hover:text-blue-600"
                  aria-label="Email"
                >
                  <Mail size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          {navSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-white light:text-slate-900 text-xs font-bold tracking-widest uppercase font-mono text-cyan-400 light:text-blue-600">
                // {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 light:text-slate-600 hover:text-cyan-300 light:hover:text-blue-700 text-sm font-medium transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400 light:text-blue-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cyan-500/15 light:border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 light:text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>Academic Portal &bull; Telkom University Jakarta &bull; {studyProgram}</span>
          </div>
          <span>
            &copy; 2026 {classNameCode} &mdash; Academic Class Hub
          </span>
        </div>
      </div>
    </footer>
  );
}
