"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Save,
  CheckCircle,
  Loader2,
  Building,
  Sparkles,
  Users,
  Target,
  Compass,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Edit3,
  Quote,
  CheckCircle2,
} from "lucide-react";
import { updateAboutAction } from "@/lib/actions/settings";
import { GithubIcon, InstagramIcon, DiscordIcon, LinkedinIcon } from "@/components/icons";

interface StudentOption {
  id: string;
  name: string;
  studentNumber?: string;
  major?: string;
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
  color: string;
}

interface AboutEditorProps {
  initialSettings: Record<string, string>;
  students: StudentOption[];
}

const COLOR_OPTIONS = [
  { label: "Cyan - Biru", value: "from-cyan-500 to-blue-600" },
  { label: "Biru - Indigo", value: "from-blue-600 to-indigo-600" },
  { label: "Indigo - Ungu", value: "from-indigo-600 to-purple-600" },
  { label: "Ungu - Pink", value: "from-purple-600 to-pink-600" },
  { label: "Emerald - Teal", value: "from-emerald-500 to-teal-600" },
  { label: "Amber - Oranye", value: "from-amber-500 to-orange-600" },
];

export function AboutEditor({ initialSettings, students }: AboutEditorProps) {
  const [activeTab, setActiveTab] = useState<"identitas" | "visi-nilai" | "pengurus" | "sambutan" | "preview">("identitas");

  // Parse initial values
  let initialValuesParsed: ValueItem[] = [
    {
      title: "Integritas Akademik",
      description: "Kejujuran dalam setiap penugasan, ujian, dan riset kelompok.",
    },
    {
      title: "Kolaborasi Terbuka",
      description: "Berbagi wawasan, modul, dan pendampingan sebaya tanpa membeda-bedakan.",
    },
    {
      title: "Adaptif & Visioner",
      description: "Cepat beradaptasi dengan perkembangan teknologi industri dan kecerdasan buatan.",
    },
  ];
  if (initialSettings.aboutValues) {
    try {
      const parsed = JSON.parse(initialSettings.aboutValues);
      if (Array.isArray(parsed) && parsed.length > 0) initialValuesParsed = parsed;
    } catch {
      // fallback
    }
  }

  // Parse initial leaders
  let initialLeadersParsed: LeaderItem[] = [
    {
      role: "Ketua Kelas (Class President)",
      name: "Sigma Pratama",
      studentId: students[0]?.id || "stu-1",
      description:
        "Bertanggung jawab atas koordinasi angkatan, narahubung utama dosen pengampu, dan pergerakan kegiatan kelas.",
      color: "from-cyan-500 to-blue-600",
    },
    {
      role: "Wakil & Sekretaris",
      name: "Davina Aurelia",
      studentId: students[1]?.id || "stu-2",
      description:
        "Mengelola dokumentasi akademik, arsip jadwal perkuliahan, pengumuman tugas, dan notulensi kelas.",
      color: "from-blue-600 to-indigo-600",
    },
    {
      role: "Koordinator Akademik & Lab",
      name: "Ibrahim Rasyid",
      studentId: students[2]?.id || "stu-3",
      description:
        "Mengkoordinasikan kelompok belajar mandiri, praktikum laboratorium, dan tim kompetisi pemrograman.",
      color: "from-indigo-600 to-purple-600",
    },
  ];
  if (initialSettings.aboutLeaders) {
    try {
      const parsed = JSON.parse(initialSettings.aboutLeaders);
      if (Array.isArray(parsed) && parsed.length > 0) initialLeadersParsed = parsed;
    } catch {
      // fallback
    }
  }

  const [formData, setFormData] = useState({
    classCode: initialSettings.classCode || "JS1SI-26-REG-05",
    studyProgram: initialSettings.studyProgram || "S1 Sistem Informasi",
    institutionName: initialSettings.institutionName || "Telkom University Jakarta",
    academicYear: initialSettings.academicYear || "Semester Ganjil 2026/2027",
    waliDosen: initialSettings.waliDosen || "Muhammad Ardiansyah",
    classDescription:
      initialSettings.classDescription ||
      "Rumah digital dan wadah kolaboratif mahasiswa S1 Sistem Informasi Telkom University Jakarta kelas JS1SI-26-REG-05 untuk saling bertumbuh, berbagi materi, dan belajar bersama setiap hari.",
    aboutVision:
      initialSettings.aboutVision ||
      "Mewujudkan kelas JS1SI-26-REG-05 sebagai lingkungan akademik yang solid, inovatif, dan berdaya saing tinggi, dengan penguasaan mendalam di bidang sistem enterprise, arsitektur data, dan rekayasa perangkat lunak modern.",
    aboutMission:
      initialSettings.aboutMission ||
      "Membangun atmosfer belajar yang kolaboratif, memperkuat keterampilan teknis dan soft skill, serta aktif berpartisipasi dalam kompetisi akademik dan inovasi digital.",
    aboutWaliDosenMessage:
      initialSettings.aboutWaliDosenMessage ||
      "Selamat datang di ruang digital kelas JS1SI-26-REG-05. Mari bersama kita bangun atmosfer perkuliahan yang saling mendukung, penuh integritas, dan siap menjadi talenta sistem informasi unggul untuk masa depan bangsa.",
    contactEmail: initialSettings.contactEmail || "",
    githubUrl: initialSettings.githubUrl || "",
    instagramUrl: initialSettings.instagramUrl || "",
    discordUrl: initialSettings.discordUrl || "",
    linkedinUrl: initialSettings.linkedinUrl || "",
  });

  const [valuesList, setValuesList] = useState<ValueItem[]>(initialValuesParsed);
  const [leadersList, setLeadersList] = useState<LeaderItem[]>(initialLeadersParsed);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handlers for values
  function handleAddValue() {
    setValuesList([...valuesList, { title: "", description: "" }]);
  }

  function handleUpdateValue(index: number, field: keyof ValueItem, val: string) {
    const updated = [...valuesList];
    updated[index][field] = val;
    setValuesList(updated);
  }

  function handleRemoveValue(index: number) {
    setValuesList(valuesList.filter((_, i) => i !== index));
  }

  // Handlers for leaders
  function handleAddLeader() {
    setLeadersList([
      ...leadersList,
      {
        role: "Koordinator",
        name: "",
        studentId: "",
        description: "",
        color: "from-cyan-500 to-blue-600",
      },
    ]);
  }

  function handleUpdateLeader(index: number, field: keyof LeaderItem, val: string) {
    const updated = [...leadersList];
    if (field === "studentId") {
      updated[index].studentId = val;
      const found = students.find((s) => s.id === val);
      if (found && (!updated[index].name || updated[index].name === "")) {
        updated[index].name = found.name;
      }
    } else if (field === "role" || field === "name" || field === "description" || field === "color") {
      updated[index][field] = val;
    }
    setLeadersList(updated);
  }

  function handleRemoveLeader(index: number) {
    setLeadersList(leadersList.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    // Validate that required fields are not empty
    if (!formData.classCode.trim()) {
      setStatusMessage({ type: "error", text: "Kode kelas wajib diisi!" });
      return;
    }
    if (!formData.studyProgram.trim()) {
      setStatusMessage({ type: "error", text: "Program studi wajib diisi!" });
      return;
    }

    startTransition(async () => {
      const payload = {
        ...formData,
        aboutValues: valuesList.filter((v) => v.title.trim().length > 0),
        aboutLeaders: leadersList.filter((l) => l.role.trim().length > 0 && l.name.trim().length > 0),
      };

      const res = await updateAboutAction(payload);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Konten Halaman Tentang berhasil disimpan! Halaman publik /about telah diperbarui secara instan.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Gagal menyimpan konten Halaman Tentang.",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
          }`}
        >
          {statusMessage.type === "success" && (
            <CheckCircle className="text-emerald-500 shrink-0" size={18} />
          )}
          <span className="font-medium flex-1">{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-surface-muted/60 dark:bg-slate-900/60 rounded-xl border border-border overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("identitas")}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 ${
            activeTab === "identitas"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface/80"
          }`}
        >
          <Building size={15} />
          <span>Identitas & Hero</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("visi-nilai")}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 ${
            activeTab === "visi-nilai"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface/80"
          }`}
        >
          <Target size={15} />
          <span>Visi, Misi & Nilai</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pengurus")}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 ${
            activeTab === "pengurus"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface/80"
          }`}
        >
          <Users size={15} />
          <span>Pengurus Kelas ({leadersList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sambutan")}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 ${
            activeTab === "sambutan"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface/80"
          }`}
        >
          <Quote size={15} />
          <span>Pesan Wali Dosen</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 ${
            activeTab === "preview"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface/80"
          }`}
        >
          <Eye size={15} />
          <span>Live Preview</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── TAB 1: IDENTITAS & HERO ── */}
        {activeTab === "identitas" && (
          <div className="card p-6 border border-border bg-card shadow-xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Building size={18} className="text-brand-500" />
                <span>Identitas Utama & Banner Header</span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Informasi dasar kelas yang tampil di bagian atas halaman Tentang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Kode Kelas *</label>
                <input
                  type="text"
                  value={formData.classCode}
                  onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                  placeholder="Contoh: JS1SI-26-REG-05"
                  className="form-input text-sm w-full bg-surface border-border text-text-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Program Studi *</label>
                <input
                  type="text"
                  value={formData.studyProgram}
                  onChange={(e) => setFormData({ ...formData, studyProgram: e.target.value })}
                  placeholder="Contoh: S1 Sistem Informasi"
                  className="form-input text-sm w-full bg-surface border-border text-text-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Institusi / Universitas *</label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  placeholder="Contoh: Telkom University Jakarta"
                  className="form-input text-sm w-full bg-surface border-border text-text-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Periode / Semester *</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="Contoh: Semester Ganjil 2026/2027"
                  className="form-input text-sm w-full bg-surface border-border text-text-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Nama Wali Dosen *</label>
                <input
                  type="text"
                  value={formData.waliDosen}
                  onChange={(e) => setFormData({ ...formData, waliDosen: e.target.value })}
                  placeholder="Contoh: Muhammad Ardiansyah"
                  className="form-input text-sm w-full bg-surface border-border text-text-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Email Kontak Resmi</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="Contoh: si2605@telkomuniversity.ac.id"
                  className="form-input text-sm w-full bg-surface border-border text-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary mb-1 block">Deskripsi Kelas</label>
              <textarea
                value={formData.classDescription}
                onChange={(e) => setFormData({ ...formData, classDescription: e.target.value })}
                rows={3}
                placeholder="Deskripsi singkat peran dan identitas kelas..."
                className="form-input text-sm w-full bg-surface border-border text-text-primary"
              />
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
                Tautan Media Sosial & Komunitas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1.5">
                    <GithubIcon size={13} />
                    <span>GitHub URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="form-input text-sm w-full bg-surface border-border text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1.5">
                    <InstagramIcon size={13} />
                    <span>Instagram URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="form-input text-sm w-full bg-surface border-border text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1.5">
                    <DiscordIcon size={13} />
                    <span>Discord Invite URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.discordUrl}
                    onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
                    placeholder="https://discord.gg/..."
                    className="form-input text-sm w-full bg-surface border-border text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1.5">
                    <LinkedinIcon size={13} />
                    <span>LinkedIn URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="form-input text-sm w-full bg-surface border-border text-text-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: VISI, MISI & NILAI ── */}
        {activeTab === "visi-nilai" && (
          <div className="card p-6 border border-border bg-card shadow-xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Target size={18} className="text-brand-500" />
                <span>Visi, Misi & Nilai Utama Kelas</span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Definisikan arah tujuan dan prinsip dasar kebersamaan kelas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Visi Kelas</label>
                <textarea
                  value={formData.aboutVision}
                  onChange={(e) => setFormData({ ...formData, aboutVision: e.target.value })}
                  rows={4}
                  placeholder="Tuliskan visi akademik dan tujuan masa depan kelas..."
                  className="form-input text-sm w-full bg-surface border-border text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary mb-1 block">Misi Kelas</label>
                <textarea
                  value={formData.aboutMission}
                  onChange={(e) => setFormData({ ...formData, aboutMission: e.target.value })}
                  rows={4}
                  placeholder="Langkah-langkah strategis dan atmosfer belajar yang ingin dicapai..."
                  className="form-input text-sm w-full bg-surface border-border text-text-primary"
                />
              </div>
            </div>

            {/* Core Values Dynamic List */}
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Compass size={16} className="text-brand-500" />
                    <span>Daftar Nilai-Nilai Utama ({valuesList.length})</span>
                  </h4>
                  <p className="text-xs text-text-muted">
                    Poin nilai yang akan dirender dengan tanda centang di kartu Nilai Utama.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddValue}
                  className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
                >
                  <Plus size={14} />
                  <span>Tambah Nilai</span>
                </button>
              </div>

              <div className="space-y-3">
                {valuesList.map((val, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border bg-surface flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="w-full sm:w-1/3">
                      <input
                        type="text"
                        value={val.title}
                        onChange={(e) => handleUpdateValue(idx, "title", e.target.value)}
                        placeholder="Judul Nilai (e.g. Integritas)"
                        className="form-input text-xs w-full bg-card border-border text-text-primary"
                        required
                      />
                    </div>
                    <div className="w-full sm:flex-1">
                      <input
                        type="text"
                        value={val.description}
                        onChange={(e) => handleUpdateValue(idx, "description", e.target.value)}
                        placeholder="Deskripsi nilai..."
                        className="form-input text-xs w-full bg-card border-border text-text-primary"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(idx)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors self-end sm:self-center shrink-0"
                      title="Hapus Nilai"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: PENGURUS KELAS ── */}
        {activeTab === "pengurus" && (
          <div className="card p-6 border border-border bg-card shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <ShieldCheck size={18} className="text-brand-500" />
                  <span>Struktur Kepengurusan Kelas ({leadersList.length})</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Atur daftar ketua, wakil, sekretaris, bendahara, dan koordinator akademik.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLeader}
                className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs self-start sm:self-center"
              >
                <Plus size={14} />
                <span>Tambah Pengurus</span>
              </button>
            </div>

            <div className="space-y-4">
              {leadersList.map((lead, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-surface space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-brand-500">
                      Pengurus #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLeader(idx)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 p-1"
                    >
                      <Trash2 size={13} />
                      <span>Hapus</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">Jabatan / Role *</label>
                      <input
                        type="text"
                        value={lead.role}
                        onChange={(e) => handleUpdateLeader(idx, "role", e.target.value)}
                        placeholder="Contoh: Ketua Kelas (Class President)"
                        className="form-input text-xs w-full bg-card border-border text-text-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">Nama Mahasiswa *</label>
                      <input
                        type="text"
                        value={lead.name}
                        onChange={(e) => handleUpdateLeader(idx, "name", e.target.value)}
                        placeholder="Nama lengkap pengurus"
                        className="form-input text-xs w-full bg-card border-border text-text-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">
                        Hubungkan ke Profil Mahasiswa
                      </label>
                      <select
                        value={lead.studentId || ""}
                        onChange={(e) => handleUpdateLeader(idx, "studentId", e.target.value)}
                        className="form-select text-xs w-full bg-card border-border text-text-primary"
                      >
                        <option value="">-- Pilih dari database (opsional) --</option>
                        {students.map((stu) => (
                          <option key={stu.id} value={stu.id}>
                            {stu.name} {stu.studentNumber ? `(${stu.studentNumber})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-text-primary mb-1 block">
                        Deskripsi Tanggung Jawab *
                      </label>
                      <input
                        type="text"
                        value={lead.description}
                        onChange={(e) => handleUpdateLeader(idx, "description", e.target.value)}
                        placeholder="Uraian singkat peran dalam koordinasi kelas..."
                        className="form-input text-xs w-full bg-card border-border text-text-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-1 block">Warna Gradien Kartu</label>
                      <select
                        value={lead.color}
                        onChange={(e) => handleUpdateLeader(idx, "color", e.target.value)}
                        className="form-select text-xs w-full bg-card border-border text-text-primary"
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {leadersList.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                  <Users className="w-8 h-8 mx-auto text-text-muted mb-2" />
                  <p className="text-xs text-text-muted">Belum ada pengurus kelas yang ditambahkan.</p>
                  <button
                    type="button"
                    onClick={handleAddLeader}
                    className="btn btn-secondary btn-sm mt-3 text-xs"
                  >
                    Tambah Pengurus Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: SAMBUTAN WALI DOSEN ── */}
        {activeTab === "sambutan" && (
          <div className="card p-6 border border-border bg-card shadow-xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Quote size={18} className="text-brand-500" />
                <span>Pesan & Sambutan Wali Dosen</span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Kutipan motivasi dan sambutan resmi dari wali dosen yang akan ditampilkan dalam kartu khusus di halaman Tentang.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary mb-1 block">
                Pesan / Kutipan Sambutan Wali Dosen
              </label>
              <textarea
                value={formData.aboutWaliDosenMessage}
                onChange={(e) => setFormData({ ...formData, aboutWaliDosenMessage: e.target.value })}
                rows={5}
                placeholder="Tulis pesan atau sambutan hangat dari wali dosen..."
                className="form-input text-sm w-full bg-surface border-border text-text-primary"
              />
              <p className="text-[11px] text-text-muted mt-1.5">
                Catatan: Nama wali dosen ({formData.waliDosen}) dan kode kelas ({formData.classCode}) akan otomatis disematkan pada atribusi kutipan.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 5: LIVE PREVIEW ── */}
        {activeTab === "preview" && (
          <div className="card p-6 border border-border bg-card shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Eye size={18} className="text-brand-500" />
                  <span>Pratinjau Langsung (Preview)</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Tampilan visual nyata seperti yang akan dilihat mahasiswa dan pengunjung di halaman /about.
                </p>
              </div>
              <Link
                href="/about"
                target="_blank"
                className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
              >
                <ExternalLink size={13} />
                <span>Buka /about Tab Baru</span>
              </Link>
            </div>

            {/* Public About Mockup */}
            <div className="rounded-2xl border border-cyan-500/30 bg-[#08152e] p-6 sm:p-8 text-white space-y-8">
              {/* Hero Banner Mockup */}
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold font-mono">
                  <Sparkles size={13} />
                  <span>Ruang Digital Kelas &bull; {formData.academicYear}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
                  {formData.classCode}
                </h1>
                <p className="text-base sm:text-lg text-cyan-300 font-bold">
                  {formData.studyProgram} &bull; {formData.institutionName}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-lg bg-[#040813]/60 border border-cyan-500/20 text-slate-300">
                    Wali Dosen: <strong className="text-white">{formData.waliDosen}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#040813]/60 border border-cyan-500/20 font-mono text-cyan-400">
                    Kelas: <strong>SI &bull; 26-05</strong>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {formData.classDescription}
                </p>
              </div>

              {/* Visi & Nilai Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-cyan-500/20">
                <div className="p-4 rounded-xl bg-[#040813]/80 border border-cyan-500/20 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Target size={16} className="text-cyan-400" />
                    <span>Visi Kelas</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{formData.aboutVision}</p>
                  {formData.aboutMission && (
                    <div className="pt-2 border-t border-cyan-500/10">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Misi</span>
                      <p className="text-xs text-slate-300">{formData.aboutMission}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#040813]/80 border border-cyan-500/20 space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Compass size={16} className="text-cyan-400" />
                    <span>Nilai Utama Kelas</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {valuesList.map((val, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 size={13} className="text-cyan-400 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-white">{val.title}:</strong> {val.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sambutan Wali Dosen Mockup */}
              {formData.aboutWaliDosenMessage && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 text-xs space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold">Pesan Wali Dosen</span>
                  <p className="text-slate-200 italic leading-relaxed">
                    &ldquo;{formData.aboutWaliDosenMessage}&rdquo;
                  </p>
                  <p className="text-[11px] text-cyan-300">
                    &mdash; <strong className="text-white">{formData.waliDosen}</strong> (Wali Dosen {formData.classCode})
                  </p>
                </div>
              )}

              {/* Pengurus Mockup */}
              <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-center text-cyan-300">
                  Struktur Kepengurusan Kelas ({leadersList.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {leadersList.map((lead, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#040813]/80 border border-cyan-500/20 text-center space-y-1.5"
                    >
                      <div
                        className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr ${lead.color} flex items-center justify-center text-white shadow-xs`}
                      >
                        <ShieldCheck size={18} />
                      </div>
                      <h5 className="font-bold text-white text-xs">{lead.name || "Nama Pengurus"}</h5>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {lead.role}
                      </span>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{lead.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button Bar */}
        <div className="card p-4 border border-border bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-10 backdrop-blur-md">
          <div className="text-xs text-text-secondary flex items-center gap-2">
            <Edit3 size={14} className="text-brand-500" />
            <span>Perubahan akan langsung mengupdate halaman publik <strong>/about</strong>.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/about"
              target="_blank"
              className="btn btn-secondary btn-sm flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs"
            >
              <ExternalLink size={14} />
              <span>Lihat Publik</span>
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary btn-sm flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
