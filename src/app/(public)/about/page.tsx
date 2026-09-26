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
    <div className="bg-slate-50 min-h-screen">
      {/* ── HERO BANNER ─────────────────────────────────── */}
      <section className="hero-gradient text-white py-20 px-4 relative overflow-hidden">
        {/* Glow circles */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
        />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-cyan-400/30 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold mb-6 text-cyan-200 shadow-sm">
            <Sparkles size={14} className="text-cyan-300" />
            <span>Academic Cohort {settings.academicYear}</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {settings.className}
          </h1>

          {settings.institutionName && (
            <p className="text-xl sm:text-2xl text-cyan-100 font-medium mb-6">
              {settings.institutionName}
            </p>
          )}

          {settings.classMotto && (
            <p className="text-lg text-cyan-200/90 italic max-w-2xl mx-auto mb-8 font-serif">
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
                className="btn btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm"
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
                className="btn btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm"
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
                className="btn btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm"
              >
                <InstagramIcon size={15} />
                <span>Instagram</span>
              </a>
            )}
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="btn btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm"
              >
                <Mail size={15} />
                <span>Contact Class</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── KEY METRICS STRIP ──────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{students.length}</div>
              <div className="text-xs text-slate-500 mt-1">Enrolled Students</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{achievements.length}</div>
              <div className="text-xs text-slate-500 mt-1">Class Honors & Awards</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{settings.academicYear}</div>
              <div className="text-xs text-slate-500 mt-1">Academic Year</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{events.length}</div>
              <div className="text-xs text-slate-500 mt-1">Events & Workshops</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Mission & Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-8 border border-slate-200/80 hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mb-5">
              <Target size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Our Vision
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              To cultivate an inclusive, ambitious, and collaborative academic environment where future
              software engineers, system architects, and tech innovators excel in technical rigor,
              ethical leadership, and impactful real-world contributions.
            </p>
          </div>

          <div className="card p-8 border border-slate-200/80 hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-5">
              <Compass size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Our Core Values
            </h2>
            <ul className="space-y-3 text-slate-600 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="font-bold text-cyan-600">&bull;</span>
                <span><strong>Innovation First:</strong> Embracing modern tools, open-source tech, and cutting-edge software practices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-cyan-600">&bull;</span>
                <span><strong>Radical Collaboration:</strong> Supporting peers through code reviews, study sprints, and mutual mentorship.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-cyan-600">&bull;</span>
                <span><strong>Community Impact:</strong> Channeling engineering talents into civic education and social volunteering.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Leadership Section */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Class Leadership & Coordination
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Elected representatives dedicated to supporting our academic journey, liaising with professors, and organizing events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaders.map((lead) => {
              const Icon = lead.icon;
              return (
                <div key={lead.role} className="card p-6 border border-slate-200 hover:shadow-lg transition-all text-center flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${lead.color} text-white flex items-center justify-center shadow-md mb-4`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">{lead.student.name}</h3>
                  <span className="badge badge-blue text-xs my-2">{lead.role}</span>
                  <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
                    {lead.description}
                  </p>
                  {lead.student.id && (
                    <Link
                      href={`/students/${lead.student.id}`}
                      className="mt-4 text-xs font-semibold text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
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
          <section className="card p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Upcoming Class Activities
                </h2>
                <p className="text-slate-500 text-sm">Non-recurring activities, gatherings, and workshops</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {upcomingEvents.map((ev) => (
                <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <span className="badge badge-blue text-xs mb-2">Class Event</span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-slate-500 text-xs line-clamp-2 mb-3">{ev.description}</p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 space-y-1">
                    <div>📅 {formatDate(ev.eventDate)}</div>
                    {ev.location && <div className="truncate">📍 {ev.location}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="hero-gradient text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Explore Our Cohort Directory
          </h2>
          <p className="text-cyan-100 text-sm sm:text-base max-w-xl mx-auto mb-6">
            Get to know each of our {students.length} fellow students, their dreams, coding portfolios, and achievements.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/students" className="btn btn-lg bg-white text-slate-900 hover:bg-slate-100 font-bold">
              <Users size={16} />
              View Student Profiles
            </Link>
            <Link href="/achievements" className="btn btn-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold">
              <Trophy size={16} />
              Hall of Fame
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
