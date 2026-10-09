import React from "react";
import {
  Sparkles,
  BarChart3,
  Calendar,
  Compass,
  CheckSquare,
  BookOpen,
  Trophy,
  Users,
  ImageIcon,
  FileText,
  Info,
} from "lucide-react";
import { SectionKey } from "./types";

export interface SectionMeta {
  key: SectionKey;
  label: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
}

export const SECTION_REGISTRY: Record<SectionKey, SectionMeta> = {
  hero: {
    key: "hero",
    label: "Hero & Identitas",
    badge: "Utama",
    description: "Header pembuka, nama kelas, slogan, dan tombol navigasi utama.",
    icon: Sparkles,
    accentColor: "from-cyan-500 to-blue-600",
  },
  stats: {
    key: "stats",
    label: "Statistik Akademik",
    badge: "Real-time",
    description: "Metrik jumlah mahasiswa, mata kuliah, tugas, materi, dan prestasi.",
    icon: BarChart3,
    accentColor: "from-blue-600 to-indigo-600",
  },
  today_schedule: {
    key: "today_schedule",
    label: "Jadwal Kuliah Hari Ini",
    badge: "Akademik",
    description: "Agenda kuliah harian, ruangan kelas, dan dosen pengampu.",
    icon: Calendar,
    accentColor: "from-indigo-600 to-purple-600",
  },
  campus_links: {
    key: "campus_links",
    label: "Akses Cepat Kampus",
    badge: "Utilitas",
    description: "Tautan ke portal resmi MyTelU, LMS Tel-U, dan iGracias.",
    icon: Compass,
    accentColor: "from-sky-500 to-cyan-600",
  },
  upcoming_tasks: {
    key: "upcoming_tasks",
    label: "Tugas & Deadline",
    badge: "Pengingat",
    description: "Daftar tugas terdekat dengan tenggat waktu.",
    icon: CheckSquare,
    accentColor: "from-amber-500 to-orange-600",
  },
  materials: {
    key: "materials",
    label: "Materi Kuliah",
    badge: "Repositori",
    description: "Pratinjau slide presentasi dan materi terbaru.",
    icon: BookOpen,
    accentColor: "from-emerald-500 to-teal-600",
  },
  achievements: {
    key: "achievements",
    label: "Prestasi Kelas",
    badge: "Apresiasi",
    description: "Pencapaian mahasiswa dalam kompetisi dan kejuaraan.",
    icon: Trophy,
    accentColor: "from-yellow-500 to-amber-600",
  },
  students: {
    key: "students",
    label: "Teman Satu Kelas",
    badge: "Komunitas",
    description: "Profil rekan mahasiswa satu angkatan.",
    icon: Users,
    accentColor: "from-violet-500 to-purple-600",
  },
  gallery: {
    key: "gallery",
    label: "Galeri Kegiatan",
    badge: "Dokumentasi",
    description: "Foto momen kebersamaan dan kegiatan perkuliahan.",
    icon: ImageIcon,
    accentColor: "from-pink-500 to-rose-600",
  },
  daily_notes: {
    key: "daily_notes",
    label: "Catatan Kelas",
    badge: "Jurnal",
    description: "Rangkuman materi harian dan notulensi perkuliahan.",
    icon: FileText,
    accentColor: "from-teal-500 to-emerald-600",
  },
  about: {
    key: "about",
    label: "Tentang Kelas",
    badge: "Profil",
    description: "Sorotan visi, nilai utama, dan struktur pengurus kelas.",
    icon: Info,
    accentColor: "from-blue-500 to-cyan-600",
  },
};

export function getSectionMeta(key: SectionKey): SectionMeta {
  return SECTION_REGISTRY[key] || {
    key,
    label: key,
    badge: "Section",
    description: "Section kustom WebKelas",
    icon: Sparkles,
    accentColor: "from-slate-500 to-slate-700",
  };
}
