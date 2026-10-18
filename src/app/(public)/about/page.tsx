import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Users,
  Trophy,
  Calendar,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Layers,
  Award,
  Quote,
  CheckCircle2,
  Code,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { getSettings, getClassEventsData, getStudentsData, getAchievementsData } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Tentang Kelas | ${settings.classCode || "JS1SI-26-REG-05"}`,
    description: `Tentang kelas ${settings.classCode || "JS1SI-26-REG-05"} program studi ${settings.studyProgram || "S1 Sistem Informasi"} ${settings.institutionName || "Telkom University Jakarta"}, di bawah bimbingan Wali Dosen ${settings.waliDosen || "Muhammad Ardiansyah"}.`,
  };
}

interface ValueItem {
  title: string;
  description: string;
}

interface LeaderItem {
  role: string;
  name: string;
  studentId?: string | null;
  description: string;
  color?: string;
}

const DEFAULT_ASPIRATION =
  "Selama menjadi mahasiswa Telkom University, saya berharap dapat terus mengembangkan kemampuan di bidang teknologi dan programming, khususnya dalam membangun sistem perangkat lunak yang efisien untuk memecahkan masalah nyata. Saya ingin mendapatkan pengalaman baru melalui berbagai proyek kampus, memperluas relasi, serta belajar berkolaborasi dengan individu dari berbagai latar belakang untuk mengasah kemampuan komunikasi dan problem-solving. Lebih dari sekadar fokus pada akademik, saya ingin menghasilkan karya teknologi yang bermanfaat dan mengaplikasikan nilai-nilai Harmony, Excellence, dan Integrity (HEI), guna mempersiapkan diri menjadi seorang profesional yang tangguh, adaptif, dan kompeten di industri teknologi masa depan.";

const DEFAULT_HEI_VALUES: ValueItem[] = [
  {
    title: "Harmony",
    description:
      "Build harmonious relationships, respect differences, and collaborate with people from diverse backgrounds.",
  },
  {
    title: "Excellence",
    description:
      "Continuously improve skills, produce high-quality work, and pursue excellence in learning and technology development.",
  },
  {
    title: "Integrity",
    description:
      "Uphold honesty, responsibility, and ethical behavior in learning, collaboration, and technology development.",
  },
];

export default async function AboutPage() {
  const [settings, , { students }, { achievements }] = await Promise.all([
    getSettings(),
    getClassEventsData(),
    getStudentsData(),
    getAchievementsData(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";
  const studyProgram = settings.studyProgram || "S1 Sistem Informasi";
  const institutionName = settings.institutionName || "Telkom University Jakarta";
  const waliDosen = settings.waliDosen || "Muhammad Ardiansyah";
  const academicYear = settings.academicYear || "Semester Ganjil 2026/2027";
  const aspiration = settings.aboutAspiration || DEFAULT_ASPIRATION;
  const waliDosenMessage = settings.aboutWaliDosenMessage || "";

  // Parse Values - prioritize HEI culture
  let heiValues: ValueItem[] = DEFAULT_HEI_VALUES;
  if (settings.aboutValues) {
    try {
      const parsed = JSON.parse(settings.aboutValues);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        heiValues = parsed;
      }
    } catch {
      // fallback to DEFAULT_HEI_VALUES
    }
  }

  // Parse Leaders
  let leadersRaw: LeaderItem[] = [
    {
      role: "Ketua Kelas (Class President)",
      name: "Sigma Pratama",
      studentId: "stu-1",
      description:
        "Bertanggung jawab atas koordinasi angkatan, narahubung utama dosen pengampu, dan pergerakan kegiatan kelas.",
      color: "from-cyan-500 to-blue-600",
    },
    {
      role: "Wakil & Sekretaris",
      name: "Davina Aurelia",
      studentId: "stu-2",
      description:
        "Mengelola dokumentasi akademik, arsip jadwal perkuliahan, pengumuman tugas, dan notulensi kelas.",
      color: "from-blue-600 to-indigo-600",
    },
    {
      role: "Koordinator Akademik & Lab",
      name: "Ibrahim Rasyid",
      studentId: "stu-3",
      description:
        "Mengkoordinasikan kelompok belajar mandiri, praktikum laboratorium, dan tim kompetisi pemrograman.",
      color: "from-indigo-600 to-purple-600",
    },
  ];
  if (settings.aboutLeaders) {
    try {
      const parsed = JSON.parse(settings.aboutLeaders);
      if (Array.isArray(parsed) && parsed.length > 0) {
        leadersRaw = parsed;
      }
    } catch {
      // fallback
    }
  }

  const iconOptions = [ShieldCheck, HeartHandshake, Code, Award, Layers, Users];

  const leaders = leadersRaw.map((lead, idx) => {
    const matchedStudent = lead.studentId
      ? students.find((s) => s.id === lead.studentId)
      : students.find((s) => s.name.toLowerCase() === lead.name.toLowerCase());

    const Icon = iconOptions[idx % iconOptions.length];

    return {
      role: lead.role,
      name: lead.name || matchedStudent?.name || "Mahasiswa",
      student: matchedStudent || null,
      description: lead.description,
      icon: Icon,
      color: lead.color || "from-cyan-500 to-blue-600",
    };
  });

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      {/* ── HERO BANNER: 1. CLASS INTRODUCTION & 4. OFFICIAL INSTAGRAM ── */}
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 mb-12">
        <div className="card p-8 sm:p-12 bg-[#08152e]/90 light:bg-white border-cyan-500/30 light:border-slate-200 shadow-[0_0_35px_rgba(6,182,212,0.15)] light:shadow-md space-y-6 text-center relative overflow-hidden backdrop-blur-xl">
          {/* Subtle Cyber Grid & Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 text-xs font-semibold tracking-wider uppercase font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Sparkles size={13} className="text-cyan-400 light:text-blue-600 animate-pulse" />
            <span>Ruang Digital Kelas &bull; {academicYear}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white light:text-slate-900 font-display tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 light:from-blue-600 light:to-cyan-600">
                {classCode}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-cyan-300 light:text-blue-600 font-display font-bold">
              {studyProgram} &bull; {institutionName}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/60 light:bg-slate-100 border border-cyan-500/20 light:border-slate-200 text-xs sm:text-sm text-slate-300 light:text-slate-700 font-medium">
              <span>Wali Dosen:</span>{" "}
              <strong className="text-white light:text-slate-900 font-bold">{waliDosen}</strong>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/60 light:bg-slate-100 border border-cyan-500/20 light:border-slate-200 text-xs sm:text-sm text-slate-300 light:text-slate-700 font-mono">
              Kelas: <strong className="text-cyan-400 light:text-blue-600 font-bold">SI &bull; 26-05</strong>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-300 light:text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {settings.classDescription ||
              "Rumah digital dan wadah kolaboratif mahasiswa S1 Sistem Informasi Telkom University Jakarta kelas JS1SI-26-REG-05 untuk saling bertumbuh, berbagi materi, dan belajar bersama setiap hari."}
          </p>

          {/* 4. Official Class Instagram Link (Only Official Instagram) */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            {settings.instagramUrl && settings.instagramUrl.trim().length > 0 ? (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-300/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                aria-label="Instagram Resmi Kelas"
              >
                <InstagramIcon size={16} />
                <span>Instagram Resmi Kelas</span>
                <ArrowRight size={13} className="opacity-90" />
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 light:bg-slate-100 border border-cyan-500/20 light:border-slate-200 text-slate-400 text-xs font-medium">
                <InstagramIcon size={14} className="opacity-60" />
                <span>Instagram resmi kelas belum dikonfigurasi</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ──────────────────────────── */}
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.08)] flex items-center gap-3.5 group hover:border-cyan-400/40 transition-all">
            <Users className="w-8 h-8 text-cyan-400 light:text-blue-600 shrink-0" />
            <div>
              <div className="text-2xl font-black text-white light:text-slate-900 font-mono">{students.length}</div>
              <div className="text-xs text-slate-400 light:text-slate-500">Mahasiswa</div>
            </div>
          </div>
          <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.08)] flex items-center gap-3.5 group hover:border-cyan-400/40 transition-all">
            <Trophy className="w-8 h-8 text-amber-400 light:text-amber-600 shrink-0" />
            <div>
              <div className="text-2xl font-black text-white light:text-slate-900 font-mono">{achievements.length}</div>
              <div className="text-xs text-slate-400 light:text-slate-500">Prestasi Kelas</div>
            </div>
          </div>
          <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.08)] flex items-center gap-3.5 group hover:border-cyan-400/40 transition-all">
            <GraduationCap className="w-8 h-8 text-blue-400 light:text-blue-600 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white light:text-slate-900 leading-tight">S1 SI</div>
              <div className="text-xs text-slate-400 light:text-slate-500">Program Studi</div>
            </div>
          </div>
          <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.08)] flex items-center gap-3.5 group hover:border-cyan-400/40 transition-all">
            <Calendar className="w-8 h-8 text-purple-400 light:text-purple-600 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white light:text-slate-900 leading-tight">Ganjil 26/27</div>
              <div className="text-xs text-slate-400 light:text-slate-500">Periode Akademik</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. OUR ASPIRATION (ASPIRASI KAMI) ──────────────────────────── */}
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 mb-12">
        <div className="card p-8 sm:p-10 bg-gradient-to-br from-[#0c234a]/85 to-[#08152e]/95 light:from-blue-50/70 light:to-white border-cyan-500/30 light:border-blue-200 shadow-[0_0_25px_rgba(6,182,212,0.12)] relative overflow-hidden space-y-4">
          <Quote className="absolute -top-3 -right-3 w-32 h-32 text-cyan-400/10 light:text-blue-300/20 pointer-events-none" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-cyan-500/15 light:bg-blue-100 text-cyan-300 light:text-blue-700 border border-cyan-500/30 light:border-blue-200">
              <Sparkles size={12} className="text-cyan-400 light:text-blue-600" />
              Aspirasi Kami &bull; Our Aspiration
            </span>
          </div>
          <div className="space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 font-display tracking-tight">
              Komitmen Tumbuh &amp; Berkarya Mahasiswa Telkom University
            </h2>
            <div className="prose prose-invert light:prose-slate max-w-none text-slate-200 light:text-slate-700 text-sm sm:text-base leading-relaxed space-y-3">
              <p className="text-justify sm:text-left leading-relaxed">
                {aspiration}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. OUR CORE VALUES: HEI (HARMONY, EXCELLENCE, INTEGRITY) ────────── */}
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 mb-16 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 light:bg-blue-100 border border-cyan-500/30 light:border-blue-200 text-xs font-mono font-semibold text-cyan-300 light:text-blue-700 uppercase shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            Budaya Karakter &bull; HEI Culture
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900 font-display">
            Our Core Values: HEI
          </h2>
          <p className="text-slate-400 light:text-slate-600 text-xs sm:text-sm">
            Tiga pilar nilai luhur yang memandu pembelajaran, kerja sama, dan etika pengembangan teknologi kami di Telkom University.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Harmony */}
          <div className="card p-6 bg-[#08152e]/85 light:bg-white border-cyan-500/20 light:border-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.08)] hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 light:bg-blue-50 border border-cyan-500/30 light:border-blue-200 text-cyan-400 light:text-blue-600 flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                <HeartHandshake size={22} />
              </div>
              <h3 className="text-lg font-bold text-white light:text-slate-900 font-display group-hover:text-cyan-300 light:group-hover:text-blue-600 transition-colors">
                {heiValues[0]?.title || "Harmony"}
              </h3>
              <p className="text-slate-300 light:text-slate-600 text-sm leading-relaxed">
                {heiValues[0]?.description ||
                  "Build harmonious relationships, respect differences, and collaborate with people from diverse backgrounds."}
              </p>
            </div>
            <div className="pt-3 border-t border-cyan-500/15 light:border-slate-100 flex items-center gap-1.5 text-xs font-mono text-cyan-400 light:text-blue-600 font-semibold">
              <CheckCircle2 size={13} className="text-cyan-400 light:text-blue-600" />
              <span>Harmonis &bull; Kolaboratif</span>
            </div>
          </div>

          {/* Card 2: Excellence */}
          <div className="card p-6 bg-[#08152e]/85 light:bg-white border-cyan-500/20 light:border-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.08)] hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/60 light:bg-blue-50 border border-blue-500/30 light:border-blue-200 text-blue-400 light:text-blue-600 flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                <Sparkles size={22} />
              </div>
              <h3 className="text-lg font-bold text-white light:text-slate-900 font-display group-hover:text-cyan-300 light:group-hover:text-blue-600 transition-colors">
                {heiValues[1]?.title || "Excellence"}
              </h3>
              <p className="text-slate-300 light:text-slate-600 text-sm leading-relaxed">
                {heiValues[1]?.description ||
                  "Continuously improve skills, produce high-quality work, and pursue excellence in learning and technology development."}
              </p>
            </div>
            <div className="pt-3 border-t border-cyan-500/15 light:border-slate-100 flex items-center gap-1.5 text-xs font-mono text-cyan-400 light:text-blue-600 font-semibold">
              <CheckCircle2 size={13} className="text-cyan-400 light:text-blue-600" />
              <span>Unggul &bull; Berkelanjutan</span>
            </div>
          </div>

          {/* Card 3: Integrity */}
          <div className="card p-6 bg-[#08152e]/85 light:bg-white border-cyan-500/20 light:border-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.08)] hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-950/60 light:bg-teal-50 border border-teal-500/30 light:border-teal-200 text-teal-400 light:text-teal-600 flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-white light:text-slate-900 font-display group-hover:text-cyan-300 light:group-hover:text-blue-600 transition-colors">
                {heiValues[2]?.title || "Integrity"}
              </h3>
              <p className="text-slate-300 light:text-slate-600 text-sm leading-relaxed">
                {heiValues[2]?.description ||
                  "Uphold honesty, responsibility, and ethical behavior in learning, collaboration, and technology development."}
              </p>
            </div>
            <div className="pt-3 border-t border-cyan-500/15 light:border-slate-100 flex items-center gap-1.5 text-xs font-mono text-cyan-400 light:text-blue-600 font-semibold">
              <CheckCircle2 size={13} className="text-cyan-400 light:text-blue-600" />
              <span>Jujur &bull; Bertanggung Jawab</span>
            </div>
          </div>
        </div>
      </section>

      {/* Wali Dosen Message Card (if provided) */}
      {waliDosenMessage && (
        <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 mb-16">
          <div className="card p-8 bg-gradient-to-br from-[#0c234a]/80 to-[#08152e]/90 light:from-blue-50/70 light:to-white border-cyan-500/30 light:border-blue-200 relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <Quote className="absolute top-4 right-4 w-16 h-16 text-cyan-400/10 light:text-blue-300/30 pointer-events-none" />
            <div className="max-w-3xl space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 light:bg-blue-100 text-cyan-300 light:text-blue-700 border border-cyan-500/30">
                Pesan Wali Dosen
              </span>
              <p className="text-sm sm:text-base text-slate-200 light:text-slate-700 italic leading-relaxed">
                &ldquo;{waliDosenMessage}&rdquo;
              </p>
              <div className="pt-2 text-xs text-cyan-300 light:text-blue-600 font-medium">
                &mdash; <strong className="text-white light:text-slate-900">{waliDosen}</strong> (Wali Dosen {classCode})
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Leadership Section */}
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900 font-display">
              Struktur Kepengurusan Kelas
            </h2>
            <p className="text-slate-400 light:text-slate-600 text-xs sm:text-sm">
              Perwakilan mahasiswa yang bertugas mengoordinasikan kegiatan akademik dan komunikasi dengan wali dosen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaders.map((lead, idx) => {
              const Icon = lead.icon;
              return (
                <div
                  key={`${lead.role}-${idx}`}
                  className="card p-6 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 text-center flex flex-col items-center justify-between group hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all"
                >
                  <div className="flex flex-col items-center w-full">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${lead.color} text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 group-hover:scale-105 transition-transform`}>
                      <Icon size={26} />
                    </div>
                    <h3 className="font-extrabold text-white light:text-slate-900 text-base">{lead.name}</h3>
                    <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 light:bg-blue-50 text-cyan-300 light:text-blue-700 border border-cyan-500/30 light:border-blue-200 my-2">
                      {lead.role}
                    </span>
                    <p className="text-slate-300 light:text-slate-600 text-xs leading-relaxed mt-1">
                      {lead.description}
                    </p>
                  </div>

                  {lead.student?.id && (
                    <Link
                      href={`/students/${lead.student.id}`}
                      className="mt-4 text-xs font-bold text-cyan-400 light:text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Profil Mahasiswa</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
