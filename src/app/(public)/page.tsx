import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  CheckSquare,
  Users,
  Trophy,
  BookOpen,
  FileText,
  ArrowRight,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Layers,
  Download,
  ExternalLink,
  BookMarked,
  GraduationCap,
  ImageIcon,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, DiscordIcon } from "@/components/icons";
import { getHomeData, getScheduleData } from "@/lib/data";
import { formatDate, getRelativeDeadline, cn } from "@/lib/utils";
import { ScheduleTimeline } from "@/components/home/schedule-timeline";

export const metadata: Metadata = {
  title: "JS1SI-26-REG-05 | S1 Sistem Informasi Telkom University Jakarta",
  description:
    "Academic class hub for S1 Sistem Informasi Telkom University Jakarta class JS1SI-26-REG-05 — schedules, coursework, learning materials, daily journal, cohort directory, and achievements.",
};

const CATEGORY_BADGE: Record<string, { label: string; className: string }> = {
  COMPETITION: { label: "Competition", className: "badge-amber" },
  VOLUNTEER: { label: "Volunteer", className: "badge-teal" },
  ORGANIZATION: { label: "Organization", className: "badge-purple" },
  ACADEMIC: { label: "Academic", className: "badge-blue" },
  CREATIVE: { label: "Creative", className: "badge-green" },
  TECHNOLOGY: { label: "Technology", className: "badge-cyan" },
  OTHER: { label: "Honor", className: "badge-gray" },
};

const PRIORITY_BADGE = {
  URGENT: "badge-red",
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
    latestAchievements,
    featuredStudents,
    galleryPreview,
    latestMaterials = [],
    latestDailyNotes = [],
    settings,
    todayDayOfWeek,
  } = data;

  const schedules = scheduleData.schedules || [];

  return (
    <div className="relative cosmic-canvas min-h-screen text-[var(--text-primary)] overflow-hidden transition-colors duration-200">
      {/* ── 1. HERO SECTION ─────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Glows */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[450px] rounded-full pointer-events-none opacity-30 light:opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, #2563eb 0%, #06b6d4 50%, transparent 80%)" }}
        />
        <div
          className="absolute top-1/3 left-10 w-72 h-72 rounded-full pointer-events-none opacity-20 light:opacity-5 blur-[90px]"
          style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full pointer-events-none opacity-20 light:opacity-5 blur-[100px]"
          style={{ background: "radial-gradient(circle, #1d4ed8 0%, transparent 70%)" }}
        />

        {/* Abstract Cyber Grid Lines */}
        <div className="absolute inset-0 cyber-grid opacity-30 light:opacity-15 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Eyebrow Pill: Class Code & Semester */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 text-xs sm:text-sm font-semibold tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(6,182,212,0.25)] light:shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-ping" />
            <span>{settings.classCode || "JS1SI-26-REG-05"} &bull; {settings.academicYear || "Semester Ganjil 2026/2027"}</span>
          </div>

          {/* Main Display Headline */}
          <div className="space-y-3">
            <h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white light:text-slate-900 uppercase font-display leading-[1.05]"
              style={{ textShadow: "0 0 50px rgba(6, 182, 212, 0.25)" }}
            >
              LEARN. BUILD.<br />
              <span className="text-gradient">GROW. TOGETHER.</span>
            </h1>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold tracking-wider text-cyan-300 light:text-blue-700 font-display pt-2">
              {settings.studyProgram || "S1 Sistem Informasi"} &bull; {settings.institutionName || "Telkom University Jakarta"}
            </p>
          </div>

          {/* Wali Dosen & Academic Context */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <div className="px-4 py-1.5 rounded-xl bg-slate-900/60 light:bg-white border border-cyan-500/20 light:border-slate-200 backdrop-blur-md text-xs sm:text-sm text-slate-300 light:text-slate-700 font-medium shadow-sm">
              <span className="text-slate-400 light:text-slate-500">Wali Dosen:</span>{" "}
              <strong className="text-white light:text-slate-900 font-semibold">{settings.waliDosen || "Muhammad Ardiansyah"}</strong>
            </div>
            <div className="px-4 py-1.5 rounded-xl bg-slate-900/60 light:bg-white border border-cyan-500/20 light:border-slate-200 backdrop-blur-md text-xs sm:text-sm text-slate-300 light:text-slate-700 font-mono shadow-sm">
              <span className="text-cyan-400 light:text-blue-600 font-bold">SI &bull; 26-05</span>
            </div>
          </div>

          {/* Supporting Tagline */}
          <p className="text-base sm:text-lg text-slate-300 light:text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            {settings.classDescription ||
              "Digital academic class hub and collaborative learning workspace for JS1SI-26-REG-05. Unified schedule timetable, lecture vault, course tasks, and daily class journal."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/schedule"
              className="btn btn-primary btn-lg shadow-[0_0_25px_rgba(6,182,212,0.4)] group"
            >
              <Calendar size={18} className="text-cyan-200 group-hover:scale-110 transition-transform" />
              <span>View Schedule</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/tasks"
              className="btn btn-secondary btn-lg group"
            >
              <CheckSquare size={18} className="text-cyan-400 light:text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Explore Tasks</span>
            </Link>
          </div>

          {/* Dynamic Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 light:text-slate-600 font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081326]/60 light:bg-white border border-cyan-500/20 light:border-slate-200 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>Status: Active Academic Term</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081326]/60 light:bg-white border border-cyan-500/20 light:border-slate-200 backdrop-blur-md">
              <Sparkles size={13} className="text-cyan-400 light:text-blue-600" />
              <span>{stats.studentsCount} Mahasiswa Terdaftar</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081326]/60 light:bg-white border border-cyan-500/20 light:border-slate-200 backdrop-blur-md">
              <BookOpen size={13} className="text-blue-400 light:text-blue-600" />
              <span>{stats.subjectsCount} Mata Kuliah Kurikulum</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. ACADEMIC SNAPSHOT ─────────────────────────────── */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-y border-cyan-500/15 light:border-slate-200 bg-[#050e1f]/60 light:bg-slate-50/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {[
              { label: "Total Students", value: stats.studentsCount, icon: Users, color: "text-cyan-400 light:text-blue-600", sub: "Mahasiswa" },
              { label: "Total Subjects", value: stats.subjectsCount, icon: BookOpen, color: "text-blue-400 light:text-blue-600", sub: "Mata Kuliah" },
              { label: "Upcoming Tasks", value: stats.tasksCount, icon: CheckSquare, color: "text-teal-400 light:text-teal-600", sub: "Tugas Aktif" },
              { label: "Achievements", value: stats.achievementsCount, icon: Trophy, color: "text-amber-400 light:text-amber-600", sub: "Prestasi Kelas" },
              { label: "Learning Materials", value: stats.materialsCount, icon: BookMarked, color: "text-purple-400 light:text-purple-600", sub: "Materi Kuliah" },
              { label: "Class Notes", value: stats.dailyNotesCount, icon: FileText, color: "text-emerald-400 light:text-emerald-600", sub: "Jurnal Harian" },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="card p-5 border-cyan-500/20 light:border-slate-200 bg-[#08152e]/70 light:bg-white hover:border-cyan-400/50 light:hover:border-blue-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.2)] light:shadow-[0_4px_16px_rgba(18,32,44,0.06)] transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 light:text-slate-500 uppercase">
                    METRIC // 0{idx + 1}
                  </span>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white light:text-slate-900 tracking-tight group-hover:text-cyan-300 light:group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-200 light:text-slate-800 mt-1">{stat.label}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. TODAY'S & WEEKLY SCHEDULE ─────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 light:border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/30 light:border-blue-200 text-cyan-400 light:text-blue-700 text-xs font-bold tracking-widest font-mono uppercase">
                // 01 &bull; TIMETABLE
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white light:text-slate-900 tracking-tight font-display">
                Jadwal Kuliah <span className="text-gradient">Mingguan</span>
              </h2>
              <p className="text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-xl">
                Jadwal perkuliahan Semester Ganjil 2026/2027 kelas JS1SI-26-REG-05. Dilengkapi status waktu nyata (Upcoming, Ongoing, Completed).
              </p>
            </div>
            <Link
              href="/schedule"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <Calendar size={14} className="text-cyan-400 light:text-blue-600" />
              <span>Buka Tampilan Grid &amp; Tabel</span>
            </Link>
          </div>

          {/* Interactive Timeline Component */}
          <div className="card p-6 sm:p-8 bg-[#08152e]/80 light:bg-white border-cyan-500/25 light:border-slate-200 shadow-xl light:shadow-[0_8px_30px_rgba(18,32,44,0.06)]">
            <ScheduleTimeline schedules={schedules} defaultDay={todayDayOfWeek} />
          </div>
        </div>
      </section>

      {/* ── 4. UPCOMING TASKS ───────────────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 light:border-slate-200 bg-[#050e1f]/60 light:bg-slate-50/70">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/30 light:border-blue-200 text-cyan-400 light:text-blue-700 text-xs font-bold tracking-widest font-mono uppercase">
                // 02 &bull; ACADEMIC DEADLINES
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white light:text-slate-900 tracking-tight font-display">
                Active <span className="text-gradient">Tasks &amp; Milestones</span>
              </h2>
              <p className="text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-xl">
                Pantau tenggat waktu tugas individu, tugas kelompok, serta instruksi tambahan perkuliahan secara terstruktur.
              </p>
            </div>
            <Link
              href="/tasks"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <CheckSquare size={14} className="text-cyan-400 light:text-blue-600" />
              <span>Semua Tugas ({stats.tasksCount})</span>
            </Link>
          </div>

          {upcomingTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="card p-6 bg-[#08152e]/75 light:bg-white border-cyan-500/20 light:border-slate-200 hover:border-cyan-400/50 light:hover:border-blue-400 hover:shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.2)] light:shadow-[0_4px_16px_rgba(18,32,44,0.06)] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {task.subject ? (
                          <span className="px-2.5 py-1 rounded-md bg-cyan-500/15 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 font-mono text-xs font-bold">
                            {task.subject.code}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-600 font-mono text-xs">
                            UMUM
                          </span>
                        )}
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                          task.taskType === "GROUP"
                            ? "bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700 border border-purple-500/30"
                            : task.taskType === "ADDITIONAL"
                            ? "bg-teal-500/15 light:bg-teal-50 text-teal-300 light:text-teal-700 border border-teal-500/30"
                            : "bg-blue-500/15 light:bg-blue-50 text-blue-300 light:text-blue-700 border border-blue-500/30"
                        )}>
                          [{task.taskType || "INDIVIDUAL"}]
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn("badge", PRIORITY_BADGE[task.priority] || "badge-blue")}>
                          {task.priority}
                        </span>
                        <span
                          className={cn(
                            "badge",
                            task.computedStatus === "DUE_SOON"
                              ? "badge-amber animate-pulse"
                              : task.computedStatus === "OVERDUE"
                              ? "badge-red"
                              : "badge-cyan"
                          )}
                        >
                          {task.computedStatus.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white light:text-slate-900 group-hover:text-cyan-200 light:group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-300 light:text-slate-600 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {task.groupName && (
                      <div className="text-[11px] font-mono text-purple-300 light:text-purple-700 bg-purple-500/10 light:bg-purple-50 px-2.5 py-1 rounded-md border border-purple-500/20 w-fit">
                        Kelompok: {task.groupName}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-cyan-500/15 light:border-slate-100 mt-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-300 light:text-blue-600 font-mono">
                      <Clock size={13} className="text-cyan-400 light:text-blue-600" />
                      <span>{getRelativeDeadline(task.deadline).text}</span>
                    </div>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="inline-flex items-center gap-1 font-bold text-xs text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center border-dashed border-cyan-500/25 light:border-slate-200 bg-[#08152e]/40 light:bg-white">
              <CheckSquare className="w-10 h-10 text-cyan-400/40 light:text-blue-400/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white light:text-slate-900">Semua Tugas Telah Selesai</h3>
              <p className="text-slate-400 light:text-slate-500 text-xs mt-1">Tidak ada deadline yang mendesak saat ini. Manfaatkan waktu untuk eksplorasi materi!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. LATEST LEARNING MATERIALS ───────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 light:border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 light:bg-purple-50 border border-purple-500/30 light:border-purple-200 text-purple-400 light:text-purple-700 text-xs font-bold tracking-widest font-mono uppercase">
                // 03 &bull; RESOURCE VAULT
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white light:text-slate-900 tracking-tight font-display">
                Materi Kuliah <span className="text-gradient">Terbaru</span>
              </h2>
              <p className="text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-xl">
                Akses slide presentasi kuliah, modul praktikum, buku referensi, dan materi pendukung belajar lainnya.
              </p>
            </div>
            <Link
              href="/materials"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <BookMarked size={14} className="text-cyan-400 light:text-blue-600" />
              <span>Semua Materi ({stats.materialsCount})</span>
            </Link>
          </div>

          {latestMaterials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 hover:border-cyan-400/50 light:hover:border-blue-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(6,182,212,0.25)] light:shadow-[0_4px_16px_rgba(18,32,44,0.06)] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700 border border-purple-500/30">
                        {mat.type}
                      </span>
                      {mat.subject && (
                        <span className="text-[11px] font-mono text-cyan-300 light:text-blue-600 font-semibold truncate">
                          {mat.subject.code}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white light:text-slate-900 group-hover:text-cyan-300 light:group-hover:text-blue-600 transition-colors line-clamp-2">
                      {mat.title}
                    </h3>

                    {mat.description && (
                      <p className="text-xs text-slate-300 light:text-slate-600 line-clamp-2 leading-relaxed">
                        {mat.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-cyan-500/15 light:border-slate-100 mt-4 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 light:text-slate-500 font-mono">
                      {formatDate(mat.createdAt)}
                    </span>
                    <Link
                      href={`/materials/${mat.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700"
                    >
                      <span>Buka</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center border-dashed border-cyan-500/20 light:border-slate-200 bg-[#08152e]/40 light:bg-white">
              <BookMarked className="w-8 h-8 text-cyan-400/40 light:text-blue-400/40 mx-auto mb-2" />
              <p className="text-slate-300 light:text-slate-800 font-medium text-sm">Belum ada materi kuliah yang diunggah.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 6. LATEST DAILY NOTES (CLASS JOURNAL) ─────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 light:border-slate-200 bg-[#050e1f]/60 light:bg-slate-50/70">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/30 light:border-emerald-200 text-emerald-400 light:text-emerald-700 text-xs font-bold tracking-widest font-mono uppercase">
                // 04 &bull; CLASS JOURNAL
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white light:text-slate-900 tracking-tight font-display">
                Catatan Harian <span className="text-gradient">Kuliah</span>
              </h2>
              <p className="text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-xl">
                Jurnal akademik harian kelas JS1SI-26-REG-05. Rangkuman poin pembelajaran harian, tugas terkait, dan tindak lanjut studi.
              </p>
            </div>
            <Link
              href="/daily-notes"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <FileText size={14} className="text-cyan-400 light:text-blue-600" />
              <span>Semua Catatan ({stats.dailyNotesCount})</span>
            </Link>
          </div>

          {latestDailyNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestDailyNotes.map((note) => (
                <div
                  key={note.id}
                  className="card p-6 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 hover:border-cyan-400/50 light:hover:border-blue-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(6,182,212,0.25)] light:shadow-[0_4px_16px_rgba(18,32,44,0.06)] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-cyan-300 light:text-blue-600 font-bold">
                        {formatDate(note.date)}
                      </span>
                      {note.subject && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 light:bg-blue-50 text-cyan-300 light:text-blue-700 text-[10px] font-mono border border-cyan-500/20 light:border-blue-200">
                          {note.subject.code}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white light:text-slate-900 group-hover:text-cyan-200 light:group-hover:text-blue-600 transition-colors leading-snug">
                      {note.title}
                    </h3>

                    <p className="text-xs text-slate-300 light:text-slate-600 line-clamp-3 leading-relaxed">
                      {note.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-cyan-500/15 light:border-slate-100 mt-4 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 light:text-slate-500">
                      Oleh: {note.author?.name || "Mahasiswa"}
                    </span>
                    <Link
                      href={`/daily-notes/${note.id}`}
                      className="inline-flex items-center gap-1 font-bold text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700"
                    >
                      <span>Baca Catatan</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center border-dashed border-cyan-500/20 light:border-slate-200 bg-[#08152e]/40 light:bg-white">
              <FileText className="w-8 h-8 text-cyan-400/40 light:text-blue-400/40 mx-auto mb-2" />
              <p className="text-slate-300 light:text-slate-800 font-medium text-sm">Belum ada catatan harian perkuliahan.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. ACHIEVEMENTS (HALL OF FAME) ──────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 light:border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 light:bg-amber-50 border border-amber-500/30 light:border-amber-200 text-amber-400 light:text-amber-700 text-xs font-bold tracking-widest font-mono uppercase">
                // 05 &bull; HALL OF FAME
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white light:text-slate-900 tracking-tight font-display">
                Prestasi <span className="text-gradient">Kelas</span>
              </h2>
              <p className="text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-xl">
                Apresiasi dan dokumentasi prestasi mahasiswa dalam kompetisi, akademik, riset, serta kontribusi organisasi.
              </p>
            </div>
            <Link
              href="/achievements"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <Trophy size={14} className="text-amber-400" />
              <span>Semua Prestasi ({stats.achievementsCount})</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestAchievements.map((item) => {
              const badge = CATEGORY_BADGE[item.category] || { label: "Honor", className: "badge-gray" };
              return (
                <div
                  key={item.id}
                  className="card p-6 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 hover:border-amber-400/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(245,158,11,0.2)] light:shadow-[0_4px_16px_rgba(18,32,44,0.06)] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("badge", badge.className)}>{badge.label}</span>
                      <span className="text-[11px] font-mono text-slate-400 light:text-slate-500">
                        {formatDate(item.achievementDate)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white light:text-slate-900 group-hover:text-amber-300 light:group-hover:text-amber-600 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {item.organization && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-300/80 light:text-amber-700 font-mono">
                        <Award size={13} />
                        <span>{item.organization}</span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs text-slate-300 light:text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {item.students && item.students.length > 0 && (
                    <div className="pt-4 border-t border-cyan-500/10 light:border-slate-100 mt-4">
                      <div className="text-[10px] font-mono text-slate-400 light:text-slate-500 uppercase mb-2">Penerima Apresiasi</div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.students.map(({ student }) => (
                          <span
                            key={student.id}
                            className="px-2.5 py-1 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 text-cyan-300 light:text-blue-700 text-xs font-medium"
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 light:border-slate-200 bg-[#050e1f]/60 light:bg-slate-50/70">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/30 light:border-blue-200 text-cyan-400 light:text-blue-700 text-xs font-bold tracking-widest font-mono uppercase">
                // 06 &bull; COHORT ROSTER
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white light:text-slate-900 tracking-tight font-display">
                Profil <span className="text-gradient">Mahasiswa</span>
              </h2>
              <p className="text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-xl">
                Kenali rekan sekelas di JS1SI-26-REG-05 — minat, motivasi, mimpi, serta pencapaian akademik.
              </p>
            </div>
            <Link
              href="/students"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <Users size={14} className="text-cyan-400 light:text-blue-600" />
              <span>Semua Mahasiswa ({stats.studentsCount})</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStudents.map((student) => (
              <div
                key={student.id}
                className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 hover:border-cyan-400/50 light:hover:border-blue-400 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(6,182,212,0.25)] light:shadow-[0_4px_16px_rgba(18,32,44,0.06)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-[#040813] light:bg-slate-100 border border-cyan-500/20 light:border-slate-200">
                    {student.photoUrl ? (
                      <Image
                        src={student.photoUrl}
                        alt={student.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-950 to-slate-900 light:from-blue-100 light:to-slate-200 text-cyan-400 light:text-blue-600 font-bold text-2xl font-display">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060b17] light:from-white/40 via-transparent to-transparent opacity-80" />
                    {student.studentNumber && (
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#060b17]/90 light:bg-white/90 border border-cyan-500/30 light:border-slate-300 text-cyan-300 light:text-blue-700 text-[10px] font-mono">
                        NIM {student.studentNumber}
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white light:text-slate-900 group-hover:text-cyan-300 light:group-hover:text-blue-600 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">{student.major}</p>

                  {student.dream && (
                    <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 text-cyan-300 light:text-blue-700 text-[11px] font-medium truncate">
                      🎯 {student.dream}
                    </div>
                  )}

                  {student.motivation && (
                    <p className="text-xs text-slate-400 light:text-slate-600 italic mt-3 line-clamp-2">
                      &ldquo;{student.motivation}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-cyan-500/15 light:border-slate-100 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {student.githubUrl && (
                      <a
                        href={student.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/5 light:bg-slate-100 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors"
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
                        className="w-7 h-7 rounded-lg bg-white/5 light:bg-slate-100 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors"
                        aria-label="LinkedIn"
                      >
                        <LinkedinIcon size={12} />
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/students/${student.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700"
                  >
                    <span>Profil</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CLASS MEMORIES / GALLERY ─────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 light:border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/30 light:border-blue-200 text-cyan-400 light:text-blue-700 text-xs font-bold tracking-widest font-mono uppercase">
                // 07 &bull; VISUAL CHRONICLES
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white light:text-slate-900 tracking-tight font-display">
                Dokumentasi <span className="text-gradient">Kelas</span>
              </h2>
              <p className="text-slate-400 light:text-slate-600 text-sm sm:text-base max-w-xl">
                Arsip visual kegiatan perkuliahan, praktikum laboratorium, kerja kelompok, dan momen kebersamaan kelas.
              </p>
            </div>
            <Link
              href="/gallery"
              className="btn btn-secondary text-xs sm:text-sm w-fit"
            >
              <ImageIcon size={14} className="text-cyan-400 light:text-blue-600" />
              <span>Semua Foto</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPreview.map((item, idx) => {
              const isLarge = idx === 0;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "card overflow-hidden group relative bg-[#08152e] light:bg-white border-cyan-500/20 light:border-slate-200 hover:border-cyan-400/50 light:hover:border-blue-400 transition-all",
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 10. ABOUT CLASS CALLOUT ───────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/15 light:border-slate-200 bg-[#050e1f]/60 light:bg-slate-50/70">
        <div className="max-w-7xl mx-auto">
          <div className="card p-8 sm:p-12 bg-gradient-to-br from-[#08152e] via-[#060b17] to-[#0a1a36] light:from-white light:via-blue-50/50 light:to-white border-cyan-500/30 light:border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(6,182,212,0.2)] light:shadow-[0_12px_40px_rgba(18,32,44,0.08)] relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/30 light:border-blue-200 text-cyan-400 light:text-blue-700 text-xs font-bold tracking-widest font-mono uppercase">
                  // COHORT IDENTITY &bull; TELKOM UNIVERSITY JAKARTA
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white light:text-slate-900 font-display">
                  {settings.classCode || "JS1SI-26-REG-05"} &mdash; {settings.studyProgram || "S1 Sistem Informasi"}
                </h2>
                <p className="text-slate-300 light:text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Portal akademik dan ruang belajar digital resmi untuk kelas JS1SI-26-REG-05 Telkom University Jakarta, di bawah bimbingan Wali Dosen Muhammad Ardiansyah.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/about"
                    className="btn btn-primary btn-sm group"
                  >
                    <span>Tentang Kelas &amp; Wali Dosen</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/schedule"
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Cek Jadwal Kuliah</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#040813]/70 light:bg-white border border-cyan-500/20 light:border-slate-200 font-mono text-xs space-y-3">
                <div className="text-cyan-400 light:text-blue-600 font-bold tracking-wider uppercase border-b border-cyan-500/20 light:border-slate-200 pb-2">
                  // CLASS_METADATA
                </div>
                <div className="text-slate-300 light:text-slate-700 text-[11px] leading-relaxed space-y-1">
                  <div><strong>Kode Kelas:</strong> {settings.classCode || "JS1SI-26-REG-05"}</div>
                  <div><strong>Semester:</strong> {settings.academicYear || "Semester Ganjil 2026/2027"}</div>
                  <div><strong>Wali Dosen:</strong> {settings.waliDosen || "Muhammad Ardiansyah"}</div>
                  <div><strong>Kampus:</strong> Telkom University Jakarta</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
