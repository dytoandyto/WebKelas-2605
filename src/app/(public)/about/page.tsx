import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Users,
  Target,
  Compass,
  Trophy,
  Mail,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Code,
  HeartHandshake,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, DiscordIcon } from "@/components/icons";
import { getSettings, getClassEventsData, getStudentsData, getAchievementsData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `About — ${settings.className}`,
    description: `Learn about ${settings.className} at ${settings.institutionName || "our university"}. Discover our cohort vision, leadership structure, and community.`,
  };
}

export default async function AboutPage() {
  const [settings, { events }, { students }, { achievements }] = await Promise.all([
    getSettings(),
    getClassEventsData(),
    getStudentsData(),
    getAchievementsData(),
  ]);

  const upcomingEvents = events
    .filter((e) => new Date(e.eventDate) >= new Date())
    .slice(0, 3);

  // Representative leadership roles from students
  const leaders = [
    {
      role: "Class President (Ketua Kelas)",
      student: students[0] || { name: "Andyto Pratama", major: "Informatics Engineering" },
      description: "Overseeing cohort coordination, liaison with faculty lecturers, and class initiatives.",
      icon: ShieldCheck,
      color: "from-cyan-500 to-blue-600",
    },
    {
      role: "Vice President & Secretary",
      student: students[1] || { name: "Davina Aurelia", major: "Informatics Engineering" },
      description: "Managing cohort documentation, schedules, academic notices, and internal logistics.",
      icon: HeartHandshake,
      color: "from-blue-600 to-indigo-600",
    },
    {
      role: "Academic & Tech Lead",
      student: students[2] || { name: "Ibrahim Rasyid", major: "Informatics Engineering" },
      description: "Coordinating peer tutoring, laboratory study sprints, and coding competition teams.",
      icon: Code,
      color: "from-indigo-600 to-purple-600",
    },
  ];

  return (
    <div className="cosmic-canvas min-h-screen text-slate-100 pb-20">
      {/* ── HERO BANNER ─────────────────────────────────── */}
      <section className="relative py-20 px-4 border-b border-cyan-500/20 bg-[#060f22]/70 backdrop-blur-xl overflow-hidden">
        {/* Glow circles */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563eb, transparent)" }}
        />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-6 backdrop-blur-md">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Academic Cohort {settings.academicYear}</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {settings.className}
          </h1>

          {settings.institutionName && (
            <p className="text-xl sm:text-2xl text-cyan-200 font-medium mb-6">
              {settings.institutionName}
            </p>
          )}

          {settings.classMotto && (
            <p className="text-lg text-slate-300 italic max-w-2xl mx-auto mb-8 font-serif">
              &ldquo;{settings.classMotto}&rdquo;
            </p>
          )}

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {settings.githubUrl && (
              <a
                href={settings.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a1a2f]/80 border border-cyan-500/30 text-white hover:border-cyan-400 hover:bg-cyan-950/60 text-sm font-semibold transition-all shadow-xs"
              >
                <GithubIcon size={15} />
                <span>GitHub Org</span>
              </a>
            )}
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a1a2f]/80 border border-cyan-500/30 text-white hover:border-cyan-400 hover:bg-cyan-950/60 text-sm font-semibold transition-all shadow-xs"
              >
                <LinkedinIcon size={15} />
                <span>LinkedIn</span>
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a1a2f]/80 border border-cyan-500/30 text-white hover:border-cyan-400 hover:bg-cyan-950/60 text-sm font-semibold transition-all shadow-xs"
              >
                <InstagramIcon size={15} />
                <span>Instagram</span>
              </a>
            )}
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-glow text-sm font-bold hover:brightness-110 transition-all"
              >
                <Mail size={15} />
                <span>Contact Class</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── KEY METRICS STRIP ──────────────────────────── */}
      <section className="bg-[#060f22]/70 border-b border-cyan-500/20 py-8 px-4 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-cyan-500/20 bg-[#0a1a2f]/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-white leading-none font-mono">{students.length}</div>
              <div className="text-xs text-slate-400 mt-1">Enrolled Students</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-cyan-500/20 bg-[#0a1a2f]/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-white leading-none font-mono">{achievements.length}</div>
              <div className="text-xs text-slate-400 mt-1">Honors & Awards</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-cyan-500/20 bg-[#0a1a2f]/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-white leading-none font-mono">{settings.academicYear}</div>
              <div className="text-xs text-slate-400 mt-1">Academic Year</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-cyan-500/20 bg-[#0a1a2f]/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-white leading-none font-mono">{events.length}</div>
              <div className="text-xs text-slate-400 mt-1">Events & Workshops</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Mission & Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="cyber-card p-8 rounded-3xl bg-[#0a1a2f]/70 border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-cyan-glow transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
              <Target size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Our Vision
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              To cultivate an inclusive, ambitious, and collaborative academic environment where future
              software engineers, system architects, and tech innovators excel in technical rigor,
              ethical leadership, and impactful real-world contributions.
            </p>
          </div>

          <div className="cyber-card p-8 rounded-3xl bg-[#0a1a2f]/70 border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-cyan-glow transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5">
              <Compass size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Our Core Values
            </h2>
            <ul className="space-y-3.5 text-slate-300 text-sm sm:text-base">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-cyan-400 mt-1">&bull;</span>
                <span><strong className="text-white">Innovation First:</strong> Embracing modern tools, open-source tech, and cutting-edge software practices.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-cyan-400 mt-1">&bull;</span>
                <span><strong className="text-white">Radical Collaboration:</strong> Supporting peers through code reviews, study sprints, and mutual mentorship.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-cyan-400 mt-1">&bull;</span>
                <span><strong className="text-white">Community Impact:</strong> Channeling engineering talents into civic education and social volunteering.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Leadership Section */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Class Leadership & Coordination
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Elected representatives dedicated to supporting our academic journey, liaising with professors, and organizing events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaders.map((lead) => {
              const Icon = lead.icon;
              return (
                <div
                  key={lead.role}
                  className="cyber-card p-6 rounded-3xl bg-[#0a1a2f]/70 border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-cyan-glow transition-all duration-300 text-center flex flex-col items-center group hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${lead.color} text-white flex items-center justify-center shadow-cyan-glow mb-4`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="font-extrabold text-white text-lg leading-snug">{lead.student.name}</h3>
                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 my-2.5">
                    {lead.role}
                  </span>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                    {lead.description}
                  </p>
                  {lead.student.id && (
                    <Link
                      href={`/students/${lead.student.id}`}
                      className="mt-4 text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      View Student Profile <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Class Events Preview */}
        {upcomingEvents.length > 0 && (
          <section className="cyber-card p-8 rounded-3xl bg-[#0a1a2f]/70 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Upcoming Class Activities
                </h2>
                <p className="text-slate-400 text-sm">Non-recurring gatherings, hackathons, and study workshops</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl border border-cyan-500/20 bg-[#061021]/80 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 mb-2.5">
                      Class Event
                    </span>
                    <h3 className="font-bold text-white text-base leading-snug mb-2">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-slate-300 text-xs line-clamp-2 mb-3 leading-relaxed">{ev.description}</p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-cyan-500/15 text-xs text-slate-400 space-y-1">
                    <div className="text-cyan-300 font-mono">📅 {formatDate(ev.eventDate)}</div>
                    {ev.location && <div className="truncate text-slate-300">📍 {ev.location}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden border border-cyan-500/30 bg-[#081326]/90 shadow-cyan-glow">
          <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Explore Our Cohort Directory
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Get to know each of our {students.length} fellow students, their dreams, coding portfolios, and achievements.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/students"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-cyan-glow hover:brightness-110 flex items-center gap-2 transition-all"
              >
                <Users size={16} />
                View Student Profiles
              </Link>
              <Link
                href="/achievements"
                className="px-6 py-3 rounded-full bg-[#0a1a2f] border border-cyan-500/30 text-cyan-300 font-bold text-sm hover:border-cyan-400 hover:text-white flex items-center gap-2 transition-all"
              >
                <Trophy size={16} />
                Hall of Fame
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
