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
  Layers,
  Award,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, DiscordIcon } from "@/components/icons";
import { getSettings, getClassEventsData, getStudentsData, getAchievementsData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Tentang Kelas | ${settings.classCode || "JS1SI-26-REG-05"}`,
    description: `Tentang kelas ${settings.classCode || "JS1SI-26-REG-05"} program studi ${settings.studyProgram || "S1 Sistem Informasi"} ${settings.institutionName || "Telkom University Jakarta"}, di bawah bimbingan Wali Dosen ${settings.waliDosen || "Muhammad Ardiansyah"}.`,
  };
}

export default async function AboutPage() {
  const [settings, { events }, { students }, { achievements }] = await Promise.all([
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

  const leaders = [
    {
      role: "Ketua Kelas (Class President)",
      student: students[0] || { name: "Andyto Pratama", major: "S1 Sistem Informasi" },
      description: "Bertanggung jawab atas koordinasi angkatan, narahubung utama dosen pengampu, dan pergerakan kegiatan kelas.",
      icon: ShieldCheck,
      color: "from-cyan-500 to-blue-600",
    },
    {
      role: "Wakil & Sekretaris",
      student: students[1] || { name: "Davina Aurelia", major: "S1 Sistem Informasi" },
      description: "Mengelola dokumentasi akademik, arsip jadwal perkuliahan, pengumuman tugas, dan notulensi kelas.",
      icon: HeartHandshake,
      color: "from-blue-600 to-indigo-600",
    },
    {
      role: "Koordinator Akademik & Lab",
      student: students[2] || { name: "Ibrahim Rasyid", major: "S1 Sistem Informasi" },
      description: "Mengkoordinasikan kelompok belajar mandiri, praktikum laboratorium, dan tim kompetisi pemrograman.",
      icon: Code,
      color: "from-indigo-600 to-purple-600",
    },
  ];

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      {/* ── HERO BANNER ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="card p-8 sm:p-12 bg-[#08152e]/90 light:bg-white border-cyan-500/25 light:border-slate-200 backdrop-blur-xl shadow-xl space-y-6 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 text-xs sm:text-sm font-semibold tracking-wider uppercase font-mono">
            <Sparkles size={14} className="text-cyan-400 light:text-blue-600" />
            <span>Class Academic Hub &bull; {academicYear}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white light:text-slate-900 font-display tracking-tight">
              {classCode}
            </h1>
            <p className="text-xl sm:text-2xl text-cyan-300 light:text-blue-700 font-display font-bold">
              {studyProgram} &bull; {institutionName}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="px-4 py-2 rounded-xl bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-xs sm:text-sm text-slate-300 light:text-slate-700 font-medium">
              <span>Wali Dosen:</span>{" "}
              <strong className="text-white light:text-slate-900 font-bold">{waliDosen}</strong>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-xs sm:text-sm text-slate-300 light:text-slate-700 font-mono">
              Short: <strong className="text-cyan-400 light:text-blue-600 font-bold">SI &bull; 26-05</strong>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-300 light:text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {settings.classDescription ||
              "Wadah kolaboratif akademik mahasiswa S1 Sistem Informasi Telkom University Jakarta angkatan 2026 kelas 05 untuk saling bertumbuh, berbagi catatan kuliah, dan menyelesaikan proyek perkuliahan secara terstruktur."}
          </p>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            {settings.githubUrl && (
              <a
                href={settings.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a1a2f]/80 light:bg-slate-100 border border-cyan-500/30 light:border-slate-200 text-white light:text-slate-800 text-xs font-semibold hover:border-cyan-400"
              >
                <GithubIcon size={14} />
                <span>GitHub Org</span>
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a1a2f]/80 light:bg-slate-100 border border-cyan-500/30 light:border-slate-200 text-white light:text-slate-800 text-xs font-semibold hover:border-cyan-400"
              >
                <InstagramIcon size={14} />
                <span>Instagram</span>
              </a>
            )}
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-sm"
              >
                <Mail size={14} />
                <span>Kontak Kelas</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ──────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400 light:text-blue-600 flex-shrink-0" />
            <div>
              <div className="text-2xl font-black text-white light:text-slate-900 font-mono">{students.length}</div>
              <div className="text-xs text-slate-400 light:text-slate-500">Mahasiswa</div>
            </div>
          </div>
          <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400 light:text-amber-600 flex-shrink-0" />
            <div>
              <div className="text-2xl font-black text-white light:text-slate-900 font-mono">{achievements.length}</div>
              <div className="text-xs text-slate-400 light:text-slate-500">Prestasi Kelas</div>
            </div>
          </div>
          <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-400 light:text-blue-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-white light:text-slate-900 leading-tight">S1 SI</div>
              <div className="text-xs text-slate-400 light:text-slate-500">Program Studi</div>
            </div>
          </div>
          <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-400 light:text-purple-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-white light:text-slate-900 leading-tight">Ganjil 26/27</div>
              <div className="text-xs text-slate-400 light:text-slate-500">Periode Akademik</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION & VALUES ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-8 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 light:bg-blue-50 border border-cyan-500/30 light:border-blue-200 flex items-center justify-center text-cyan-400 light:text-blue-600 mb-2">
              <Target size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white light:text-slate-900 font-display">
              Visi Kelas
            </h2>
            <p className="text-slate-300 light:text-slate-600 text-sm leading-relaxed">
              Mewujudkan kelas JS1SI-26-REG-05 sebagai lingkungan akademik yang solid, inovatif, dan berdaya saing tinggi, dengan penguasaan mendalam di bidang sistem enterprise, arsitektur data, dan rekayasa perangkat lunak modern.
            </p>
          </div>

          <div className="card p-8 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/60 light:bg-blue-50 border border-blue-500/30 light:border-blue-200 flex items-center justify-center text-blue-400 light:text-blue-600 mb-2">
              <Compass size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white light:text-slate-900 font-display">
              Nilai Utama Kelas
            </h2>
            <ul className="space-y-2.5 text-slate-300 light:text-slate-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 light:text-blue-600 font-bold">&bull;</span>
                <span><strong>Integritas Akademik:</strong> Kejujuran dalam setiap penugasan, ujian, dan riset kelompok.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 light:text-blue-600 font-bold">&bull;</span>
                <span><strong>Kolaborasi Terbuka:</strong> Berbagi wawasan, modul, dan pendampingan sebaya tanpa membeda-bedakan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 light:text-blue-600 font-bold">&bull;</span>
                <span><strong>Adaptif &amp; Visioner:</strong> Cepat beradaptasi dengan perkembangan teknologi industri dan kecerdasan buatan.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Leadership Section */}
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
            {leaders.map((lead) => {
              const Icon = lead.icon;
              return (
                <div
                  key={lead.role}
                  className="card p-6 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 text-center flex flex-col items-center justify-between group hover:-translate-y-1 transition-all"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${lead.color} text-white flex items-center justify-center shadow-md mb-4`}>
                      <Icon size={26} />
                    </div>
                    <h3 className="font-extrabold text-white light:text-slate-900 text-base">{lead.student.name}</h3>
                    <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 light:bg-blue-50 text-cyan-300 light:text-blue-700 border border-cyan-500/30 light:border-blue-200 my-2">
                      {lead.role}
                    </span>
                    <p className="text-slate-300 light:text-slate-600 text-xs leading-relaxed mt-1">
                      {lead.description}
                    </p>
                  </div>

                  {(lead.student as any).id && (
                    <Link
                      href={`/students/${(lead.student as any).id}`}
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
