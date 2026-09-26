import Link from "next/link";
import { BookOpen, Mail } from "lucide-react";
import { GithubIcon, InstagramIcon, DiscordIcon, LinkedinIcon } from "@/components/icons";

interface PublicFooterProps {
  settings?: Record<string, string>;
}

const navSections = [
  {
    title: "Public",
    links: [
      { href: "/schedule", label: "Schedule" },
      { href: "/tasks", label: "Tasks" },
      { href: "/announcements", label: "Announcements" },
      { href: "/resources", label: "Resources" },
      { href: "/about", label: "About Class" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/students", label: "Students" },
      { href: "/achievements", label: "Achievements" },
      { href: "/gallery", label: "Gallery" },
      { href: "/login", label: "Admin Login" },
    ],
  },
];

export function PublicFooter({ settings }: PublicFooterProps) {
  const className = settings?.className || "ClassHub";
  const institutionName = settings?.institutionName;
  const academicYear = settings?.academicYear || "2026/2027";
  const classMotto = settings?.classMotto;
  const githubUrl = settings?.githubUrl;
  const linkedinUrl = settings?.linkedinUrl;
  const instagramUrl = settings?.instagramUrl;
  const discordUrl = settings?.discordUrl;
  const contactEmail = settings?.contactEmail;

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <BookOpen className="text-white" size={16} />
              </div>
              <span
                className="text-white text-lg font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}
              >
                ClassHub
              </span>
            </div>
            <p className="text-slate-200 text-sm font-semibold leading-relaxed mb-0.5">{className}</p>
            {institutionName && (
              <p className="text-cyan-400/90 text-xs mb-1">{institutionName}</p>
            )}
            <p className="text-slate-500 text-xs mb-3">Academic Year {academicYear}</p>
            {classMotto && (
              <p className="text-slate-400 text-xs italic border-l-2 border-cyan-500 pl-3">
                &ldquo;{classMotto}&rdquo;
              </p>
            )}

            {/* Social links */}
            <div className="flex items-center gap-2 mt-4">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
                  aria-label="GitHub"
                >
                  <GithubIcon size={14} />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon size={14} />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={14} />
                </a>
              )}
              {discordUrl && (
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
                  aria-label="Discord"
                >
                  <DiscordIcon size={14} />
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                  aria-label="Email"
                >
                  <Mail size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Nav columns */}
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            &copy; {new Date().getFullYear()} ClassHub &mdash; {className}
          </span>
          <span>Built with Next.js &amp; Prisma</span>
        </div>
      </div>
    </footer>
  );
}
