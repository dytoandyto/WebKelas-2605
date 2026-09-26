import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  CheckSquare,
  Users,
  Trophy,
  Megaphone,
  Image as ImageIcon,
  ArrowRight,
  Clock,
  BookOpen,
  Sparkles,
  Zap,
  Terminal,
  Shield,
  Lightbulb,
  Compass,
  Cpu,
  Flame,
  Star,
  ExternalLink,
  Award,
  ChevronRight,
  Layers,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, DiscordIcon } from "@/components/icons";
import { getHomeData, getScheduleData } from "@/lib/data";
import { formatDate, getRelativeDeadline, cn } from "@/lib/utils";
import { TaskStatus, AchievementCategory } from "@prisma/client";
import { ScheduleTimeline } from "@/components/home/schedule-timeline";

export const metadata: Metadata = {
  title: "Information Systems 26 — Build. Learn. Create.",
  description:
    "Official academic platform and digital cohort hub for Information Systems 26 — schedules, tasks, coursework, honors, and student directory.",
};

const CATEGORY_BADGE: Record<AchievementCategory, { label: string; className: string }> = {
  COMPETITION: { label: "Competition", className: "badge-amber" },
  VOLUNTEER: { label: "Volunteer", className: "badge-teal" },
  ORGANIZATION: { label: "Organization", className: "badge-purple" },
  ACADEMIC: { label: "Academic", className: "badge-blue" },
  CREATIVE: { label: "Creative", className: "badge-green" },
  TECHNOLOGY: { label: "Technology", className: "badge-cyan" },
  OTHER: { label: "Honor", className: "badge-gray" },
};

const PRIORITY_BADGE = {
  HIGH: "badge-red",
  MEDIUM: "badge-amber",
  LOW: "badge-blue",
};

export default async function HomePage() {
  const [data, scheduleData] = await Promise.all([
    getHomeData(),
    getScheduleData(),
  ]);

  const {
    stats,
    upcomingTasks,
    latestAnnouncements,
    latestAchievements,
    featuredStudents,
    galleryPreview,
    settings,
    todayDayOfWeek,
  } = data;

  const schedules = scheduleData.schedules || [];

  return (
    <div className="relative cosmic-canvas min-h-screen text-slate-100 overflow-hidden">
      {/* ── 1. HERO SECTION ─────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Glows */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[450px] rounded-full pointer-events-none opacity-30 blur-[120px]"
          style={{ background: "radial-gradient(circle, #2563eb 0%, #06b6d4 50%, transparent 80%)" }}
        />
        <div
          className="absolute top-1/3 left-10 w-72 h-72 rounded-full pointer-events-none opacity-20 blur-[90px]"
          style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(circle, #1d4ed8 0%, transparent 70%)" }}
        />

        {/* Abstract Cyber Grid Lines */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs sm:text-sm font-semibold tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(6,182,212,0.25)] animate-pulse-glow">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Academic Cohort {settings.academicYear || "2026/2027"} &bull; Class of 2026</span>
          </div>

          {/* Main Display Headline */}
          <div className="space-y-3">
            <h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase font-display leading-[1.05]"
              style={{ textShadow: "0 0 50px rgba(6, 182, 212, 0.3)" }}
            >
              INFORMATION <br />
              <span className="text-gradient-cyan">SYSTEMS 26</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-widest text-cyan-300/90 font-mono pt-1">
              BUILD &bull; LEARN &bull; CREATE
            </p>
          </div>

          {/* Supporting Tagline */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {settings.classDescription ||
              "The digital ecosystem and academic portal for Information Systems Class of 2026 — bridging software architecture, intelligent data pipelines, and transformative enterprise systems."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/schedule"
              className="btn btn-primary btn-lg shadow-[0_0_25px_rgba(6,182,212,0.4)] group"
            >
              <Calendar size={18} className="text-cyan-200 group-hover:scale-110 transition-transform" />
              <span>Explore Schedule</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/tasks"
              className="btn btn-secondary btn-lg group"
            >
              <CheckSquare size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Active Assignments</span>
            </Link>
          </div>

          {/* Floating Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081326]/60 border border-cyan-500/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>Status: Active Academic Term</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081326]/60 border border-cyan-500/20 backdrop-blur-md">
              <Sparkles size={13} className="text-cyan-400" />
              <span>{stats.studentsCount} Enrolled Innovators</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081326]/60 border border-cyan-500/20 backdrop-blur-md">
              <Trophy size={13} className="text-amber-400" />
              <span>{stats.achievementsCount} Hall of Fame Honors</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. WHO WE ARE ───────────────────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest font-mono uppercase">
                // 01 &bull; WHO WE ARE
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display leading-tight">
                Architecting the Future of <br className="hidden sm:inline" />
                <span className="text-gradient-cyan">Digital Intelligence</span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Information Systems 26 represents a cohort of visionary developers, data engineers, and technology strategists. Born in an era of hyper-scale cloud, agentic computing, and data-driven commerce, we synthesize deep technical mastery with organizational innovation.
              </p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                From fullstack application engineering to distributed database architectures, our students collaborate on ambitious hackathons, scientific research, and peer mentorship sprints designed to push boundaries.
              </p>

              {/* Specialization Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { title: "Systems Architecture", desc: "Enterprise cloud, microservices & scalable backends", icon: Cpu },
                  { title: "Data Intelligence", desc: "Analytics, neural networks & predictive modeling", icon: Sparkles },
                  { title: "Product Engineering", desc: "Human-centric web applications & UX design", icon: Layers },
                ].map((spec) => (
                  <div key={spec.title} className="card p-4 bg-[#08152e]/70 border-cyan-500/20">
                    <spec.icon className="w-5 h-5 text-cyan-400 mb-2" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{spec.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{spec.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Futuristic Telemetry HUD */}
            <div className="lg:col-span-5">
              <div className="card p-6 sm:p-8 bg-[#08152e]/85 border-cyan-500/30 shadow-[0_16px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.2)] relative card-tech">
                <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                      SYSTEM_STATUS // ONLINE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">v2.6-PROD</span>
                </div>

                <div className="space-y-5 pt-5">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-400">Cohort Specialization Focus</span>
                      <span className="text-cyan-300 font-bold">100% Active</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#040813] overflow-hidden flex">
                      <div className="h-full bg-blue-600 w-[45%]" title="Systems Architecture: 45%" />
                      <div className="h-full bg-cyan-400 w-[35%]" title="Data Analytics: 35%" />
                      <div className="h-full bg-teal-400 w-[20%]" title="Product Engineering: 20%" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                      <span>45% Systems</span>
                      <span>35% Data</span>
                      <span>20% Product</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#040813]/80 border border-cyan-500/20 font-mono text-xs space-y-1.5">
                    <div className="text-cyan-400/70">$ git status --short</div>
                    <div className="text-emerald-400">M class_schedules.active</div>
                    <div className="text-emerald-400">M assignments_in_progress ({stats.tasksCount})</div>
                    <div className="text-cyan-300">&bull; branch: batch2026/main</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
                      <div className="text-xs font-mono text-slate-400">ACADEMIC YEAR</div>
                      <div className="text-sm font-bold text-white mt-0.5">{settings.academicYear || "2026/2027"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
                      <div className="text-xs font-mono text-slate-400">CLASS MOTTO</div>
                      <div className="text-sm font-bold text-cyan-300 mt-0.5 truncate">
                        {settings.classMotto || "Build. Learn. Create."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CLASS STATISTICS ─────────────────────────────── */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-y border-cyan-500/15 bg-[#050e1f]/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Enrolled Students", value: stats.studentsCount, icon: Users, color: "text-cyan-400", sub: "Active Innovators" },
              { label: "Academic Subjects", value: stats.subjectsCount, icon: BookOpen, color: "text-blue-400", sub: "Curriculum Courses" },
              { label: "Active Tasks", value: stats.tasksCount, icon: CheckSquare, color: "text-teal-400", sub: "Pending Assignments" },
              { label: "Hall of Fame Awards", value: stats.achievementsCount, icon: Trophy, color: "text-amber-400", sub: "Cohort Honors" },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="card p-6 border-cyan-500/20 bg-[#08152e]/70 hover:border-cyan-400/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.2)] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                    METRIC // 0{idx + 1}
                  </span>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 mt-1">{stat.label}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CORE VALUES ──────────────────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest font-mono uppercase">
              // 02 &bull; COHORT PILLARS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
              Our Core <span className="text-gradient-cyan">Pillars</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              The four foundational cornerstones driving our academic ethos, project engineering, and community spirit.
            </p>
          </div>

          {/* Expressive Orbital / Nexus Composition */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              {
                title: "Curious",
                tagline: "Architectural Exploration",
                description: "Deep relentless drive to dissect systems, explore bleeding-edge frameworks, and interrogate how enterprise software operates under the hood.",
                icon: Lightbulb,
                accent: "from-blue-500 to-cyan-400",
                code: "01 // EXPLORE",
              },
              {
                title: "Creative",
                tagline: "Human-Centric Solutions",
                description: "Engineering digital experiences that are intuitive, beautiful, and resilient. Transforming abstract business requirements into elegant products.",
                icon: Sparkles,
                accent: "from-cyan-400 to-teal-400",
                code: "02 // INNOVATE",
              },
              {
                title: "Collaborative",
                tagline: "Collective Intelligence",
                description: "Winning collectively. We pair-program through late-night problem sets, organize peer tutoring sprints, and share knowledge freely.",
                icon: Users,
                accent: "from-teal-400 to-emerald-400",
                code: "03 // COOPERATE",
              },
              {
                title: "Adaptive",
                tagline: "Agile Evolution",
                description: "Thriving in uncertainty. Rapidly pivoting to modern AI stacks, cloud-native deployments, and dynamic industry landscapes.",
                icon: Zap,
                accent: "from-amber-400 to-orange-400",
                code: "04 // EVOLVE",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="card p-6 sm:p-7 bg-[#08152e]/80 border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.25)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono tracking-widest text-cyan-400/80">{pillar.code}</span>
                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-tr p-[1px]", pillar.accent)}>
                      <div className="w-full h-full rounded-xl bg-[#060b17] flex items-center justify-center">
                        <pillar.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display group-hover:text-cyan-300 transition-colors">
                    {pillar.title}
                  </h3>
                  <div className="text-xs font-mono text-cyan-400/80 mb-3">{pillar.tagline}</div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{pillar.description}</p>
                </div>

                <div className="pt-6 border-t border-cyan-500/10 mt-6 flex items-center gap-1.5 text-[11px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Information Systems 26 Standard</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. WEEKLY SCHEDULE ──────────────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 bg-[#050e1f]/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest font-mono uppercase">
                // 03 &bull; TIMETABLE
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
                Weekly <span className="text-gradient-cyan">Schedule</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                Real-time timetable slots, lecture venues, and faculty assignments. Select a day to view its chronological course timeline.
              </p>
            </div>
            <Link
              href="/schedule"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <Calendar size={14} className="text-cyan-400" />
              <span>Full Schedule View</span>
            </Link>
          </div>

          {/* Interactive Timeline Component */}
          <div className="card p-6 sm:p-8 bg-[#08152e]/80 border-cyan-500/25 shadow-xl">
            <ScheduleTimeline schedules={schedules} defaultDay={todayDayOfWeek} />
          </div>
        </div>
      </section>

      {/* ── 6. UPCOMING TASKS ───────────────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest font-mono uppercase">
                // 04 &bull; ACADEMIC DEADLINES
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
                Active <span className="text-gradient-cyan">Tasks &amp; Milestones</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                Stay synchronized with pending lab assignments, project deliverables, and team sprint milestones.
              </p>
            </div>
            <Link
              href="/tasks"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <CheckSquare size={14} className="text-cyan-400" />
              <span>View All Tasks ({stats.tasksCount})</span>
            </Link>
          </div>

          {upcomingTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="card p-6 bg-[#08152e]/75 border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.2)] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-xs font-bold">
                        {task.subject.code}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={cn("badge", PRIORITY_BADGE[task.priority] || "badge-blue")}>
                          {task.priority}
                        </span>
                        <span
                          className={cn(
                            "badge",
                            task.computedStatus === TaskStatus.DUE_SOON
                              ? "badge-amber animate-pulse"
                              : task.computedStatus === TaskStatus.OVERDUE
                              ? "badge-red"
                              : "badge-cyan"
                          )}
                        >
                          {task.computedStatus.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-cyan-500/15 mt-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
                      <Clock size={13} className="text-cyan-400" />
                      <span>{getRelativeDeadline(task.deadline).text}</span>
                    </div>
                    <Link
                      href="/tasks"
                      className="inline-flex items-center gap-1 font-bold text-xs text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Details</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center border-dashed border-cyan-500/25 bg-[#08152e]/40">
              <CheckSquare className="w-10 h-10 text-cyan-400/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">All Milestones Cleared</h3>
              <p className="text-slate-400 text-xs mt-1">No active deadlines currently pending. Enjoy your focus time!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. ACHIEVEMENTS (HALL OF FAME) ──────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 bg-[#050e1f]/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest font-mono uppercase">
                // 05 &bull; HALL OF FAME
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
                Cohort <span className="text-gradient-gold">Achievements</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                Celebrating student honors across national hackathons, paper publications, algorithmic programming, and leadership.
              </p>
            </div>
            <Link
              href="/achievements"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <Trophy size={14} className="text-amber-400" />
              <span>Full Hall of Fame</span>
            </Link>
          </div>

          {/* Horizontal Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestAchievements.map((item) => {
              const badge = CATEGORY_BADGE[item.category] || { label: "Honor", className: "badge-gray" };
              return (
                <div
                  key={item.id}
                  className="card p-6 bg-[#08152e]/80 border-cyan-500/20 hover:border-amber-400/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(245,158,11,0.2)] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("badge", badge.className)}>{badge.label}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDate(item.achievementDate)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {item.organization && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-300/80 font-mono">
                        <Award size={13} />
                        <span>{item.organization}</span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {item.students && item.students.length > 0 && (
                    <div className="pt-4 border-t border-cyan-500/10 mt-4">
                      <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">Honored Recipients</div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.students.map(({ student }) => (
                          <span
                            key={student.id}
                            className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium"
                          >
                            {student.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. STUDENTS DIRECTORY ───────────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest font-mono uppercase">
                // 06 &bull; COHORT ROSTER
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
                Featured <span className="text-gradient-cyan">Classmates</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                Explore the roster of Information Systems 26 — individual portfolios, aspirations, and technical specializations.
              </p>
            </div>
            <Link
              href="/students"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <Users size={14} className="text-cyan-400" />
              <span>Full Directory ({stats.studentsCount})</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStudents.map((student) => (
              <div
                key={student.id}
                className="card p-5 bg-[#08152e]/80 border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(6,182,212,0.25)] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Status */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-[#040813] border border-cyan-500/20">
                    {student.photoUrl ? (
                      <Image
                        src={student.photoUrl}
                        alt={student.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-950 to-slate-900 text-cyan-400 font-bold text-2xl font-display">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060b17] via-transparent to-transparent opacity-80" />
                    {student.studentNumber && (
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#060b17]/90 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
                        NIM {student.studentNumber}
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{student.major}</p>

                  {student.dream && (
                    <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-medium truncate">
                      🎯 {student.dream}
                    </div>
                  )}

                  {student.motivation && (
                    <p className="text-xs text-slate-400 italic mt-3 line-clamp-2">
                      &ldquo;{student.motivation}&rdquo;
                    </p>
                  )}
                </div>

                {/* Social links & Profile CTA */}
                <div className="pt-4 border-t border-cyan-500/15 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {student.githubUrl && (
                      <a
                        href={student.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors"
                        aria-label="GitHub"
                      >
                        <GithubIcon size={12} />
                      </a>
                    )}
                    {student.linkedinUrl && (
                      <a
                        href={student.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors"
                        aria-label="LinkedIn"
                      >
                        <LinkedinIcon size={12} />
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/students/${student.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    <span>Profile</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CLASS MEMORIES / GALLERY ─────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 bg-[#050e1f]/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest font-mono uppercase">
                // 07 &bull; VISUAL CHRONICLES
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
                Class <span className="text-gradient-cyan">Memories</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                Unfiltered visual snapshots from hackathons, laboratory study sprints, campus meetups, and cohort celebrations.
              </p>
            </div>
            <Link
              href="/gallery"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <ImageIcon size={14} className="text-cyan-400" />
              <span>Full Photo Archive</span>
            </Link>
          </div>

          {/* Asymmetric Editorial Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPreview.map((item, idx) => {
              const isLarge = idx === 0;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "card overflow-hidden group relative bg-[#08152e] border-cyan-500/20 hover:border-cyan-400/50 transition-all",
                    isLarge ? "sm:col-span-2 sm:row-span-2 aspect-[16/10] sm:aspect-auto sm:min-h-[420px]" : "aspect-[4/3]"
                  )}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    sizes={isLarge ? "(max-width: 1200px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040813] via-[#040813]/40 to-transparent opacity-85 group-hover:opacity-75 transition-opacity" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 space-y-1.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono uppercase font-bold tracking-wider">
                      {item.eventDate ? formatDate(item.eventDate) : "Memory"}
                    </span>
                    <h3 className={cn("font-bold text-white group-hover:text-cyan-200 transition-colors", isLarge ? "text-xl sm:text-2xl" : "text-base")}>
                      {item.title}
                    </h3>
                    {((item as any).description || (item as any).caption) && (
                      <p className="text-xs text-slate-300 line-clamp-1">{((item as any).description || (item as any).caption)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 10. ABOUT THE CLASS (VISION & LEADERSHIP) ───────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15">
        <div className="max-w-7xl mx-auto">
          <div className="card p-8 sm:p-12 bg-gradient-to-br from-[#08152e] via-[#060b17] to-[#0a1a36] border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(6,182,212,0.2)] relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest font-mono uppercase">
                  // 08 &bull; COHORT VISION
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display">
                  Forging Next-Generation <span className="text-gradient-cyan">System Architects</span>
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Information Systems 26 was established with a singular mission: to master the convergence of technology and strategy. We cultivate a culture of excellence, active peer mentoring, and open-source contribution that extends far beyond the lecture hall.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/about"
                    className="btn btn-primary btn-sm group"
                  >
                    <span>Read Class Charter &amp; Leadership</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/resources"
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Access Learning Vault</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#040813]/70 border border-cyan-500/20 font-mono text-xs space-y-3">
                <div className="text-cyan-400 font-bold tracking-wider uppercase border-b border-cyan-500/20 pb-2">
                  // COHORT_MANIFESTO
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  &ldquo;We engineer resilient software, interrogate data with precision, and lift every member of our cohort to the highest global academic and industry standards.&rdquo;
                </div>
                <div className="text-cyan-300 text-[11px] pt-1">
                  &mdash; Information Systems 26
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
