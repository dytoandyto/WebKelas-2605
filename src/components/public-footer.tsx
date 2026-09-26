import Link from "next/link";
import { Mail, Layers, Sparkles, ArrowUpRight } from "lucide-react";
import { GithubIcon, InstagramIcon, DiscordIcon, LinkedinIcon } from "@/components/icons";

interface PublicFooterProps {
  settings?: Record<string, string>;
}

const navSections = [
  {
    title: "Academic",
    links: [
      { href: "/schedule", label: "Weekly Schedule" },
      { href: "/tasks", label: "Assignments & Tasks" },
      { href: "/resources", label: "Learning Vault" },
      { href: "/announcements", label: "Class Bulletins" },
    ],
  },
  {
    title: "Cohort",
    links: [
      { href: "/students", label: "Student Roster" },
      { href: "/achievements", label: "Hall of Fame" },
      { href: "/gallery", label: "Class Memories" },
      { href: "/about", label: "Vision & Leadership" },
    ],
  },
];

export function PublicFooter({ settings }: PublicFooterProps) {
  const className = settings?.className || "Information Systems 26";
  const institutionName = settings?.institutionName || "Faculty of Computer Science";
  const academicYear = settings?.academicYear || "2026/2027";
  const classMotto = settings?.classMotto || "Build. Learn. Create.";
  const githubUrl = settings?.githubUrl;
  const linkedinUrl = settings?.linkedinUrl;
  const instagramUrl = settings?.instagramUrl;
  const discordUrl = settings?.discordUrl;
  const contactEmail = settings?.contactEmail;

  return (
    <footer className="relative bg-[#040813] text-slate-300 border-t border-cyan-500/20 overflow-hidden mt-auto">
      {/* Ambient background glow */}
      <div
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[250px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #0284c7 0%, #06b6d4 100%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Cohort Identity */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <div className="w-full h-full rounded-full bg-[#060b17] flex items-center justify-center">
                  <Layers className="w-4.5 h-4.5 text-cyan-400" />
                </div>
              </div>
              <span className="text-white text-xl font-extrabold font-display tracking-tight">
                Information Systems <span className="text-cyan-400">26</span>
              </span>
            </div>

            <p className="text-slate-300 text-sm max-w-md leading-relaxed">
              Official digital academic platform and collaborative hub for Information Systems 26 — bridging technology, data intelligence, and business architecture.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
              <Sparkles size={12} className="text-cyan-400" />
              <span>Academic Year {academicYear} &bull; {institutionName}</span>
            </div>

            {classMotto && (
              <p className="text-cyan-200/80 text-xs font-mono tracking-wider italic pt-1">
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
                  className="w-9 h-9 rounded-xl bg-[#08152e] hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400/60 flex items-center justify-center transition-all text-slate-300 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
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
                  className="w-9 h-9 rounded-xl bg-[#08152e] hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400/60 flex items-center justify-center transition-all text-slate-300 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
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
                  className="w-9 h-9 rounded-xl bg-[#08152e] hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400/60 flex items-center justify-center transition-all text-slate-300 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
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
                  className="w-9 h-9 rounded-xl bg-[#08152e] hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400/60 flex items-center justify-center transition-all text-slate-300 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  aria-label="Discord"
                >
                  <DiscordIcon size={15} />
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="w-9 h-9 rounded-xl bg-[#08152e] hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400/60 flex items-center justify-center transition-all text-slate-300 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
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
              <h3 className="text-white text-xs font-bold tracking-widest uppercase font-mono text-cyan-400">
                // {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-cyan-300 text-sm font-medium transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cyan-500/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>Systems Online &bull; Academic Portal IS 26</span>
          </div>
          <span>
            &copy; {new Date().getFullYear()} Information Systems 26 &mdash; Built with Next.js &amp; Prisma
          </span>
        </div>
      </div>
    </footer>
  );
}
