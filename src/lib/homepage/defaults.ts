import { HomepageConfig, SectionConfig, SectionKey } from "./types";

export const DEFAULT_HOMEPAGE_SECTIONS: SectionConfig[] = [
  {
    key: "hero",
    label: "Hero & Identitas Kelas",
    description: "Header utama pembuka homepage dengan identitas kelas dan tombol aksi cepat.",
    visible: true,
    order: 0,
    settings: {
      eyebrow: "Ruang Digital Kelas",
      title: "JS1SI-26-REG-05",
      subtitle: "S1 Sistem Informasi • Telkom University Jakarta",
      description:
        "Rumah digital dan ekosistem akademik mahasiswa S1 Sistem Informasi Telkom University Jakarta kelas JS1SI-26-REG-05 untuk saling bertumbuh dan belajar bersama setiap hari.",
      academicYear: "Semester Ganjil 2026/2027",
      primaryButtonText: "Jadwal Perkuliahan",
      primaryButtonUrl: "/schedule",
      primaryButtonVisible: true,
      secondaryButtonText: "Tugas & Deadline",
      secondaryButtonUrl: "/tasks",
      secondaryButtonVisible: true,
      showClassPills: true,
      showBadges: true,
    },
  },
  {
    key: "stats",
    label: "Statistik Akademik",
    description: "Kartu metrik jumlah mahasiswa, mata kuliah, tugas aktif, materi, dan prestasi kelas.",
    visible: true,
    order: 1,
    settings: {
      title: "Aktivitas & Statistik Kelas",
      subtitle: "Ringkasan data akademik kelas yang terhubung langsung dengan database secara real-time.",
      visibleCards: {
        students: true,
        subjects: true,
        tasks: true,
        materials: true,
        achievements: true,
        dailyNotes: true,
      },
    },
  },
  {
    key: "today_schedule",
    label: "Jadwal Kuliah Hari Ini",
    description: "Daftar mata kuliah yang berlangsung hari ini lengkap dengan jam, ruang, dan dosen pengampu.",
    visible: true,
    order: 2,
    settings: {
      title: "Jadwal Kuliah Hari Ini",
      description: "Agenda perkuliahan yang terjadwal untuk hari ini. Jangan sampai terlambat masuk kelas, ya!",
      maxItems: 5,
      showRoom: true,
      showLecturer: true,
      buttonText: "Lihat Jadwal Lengkap",
    },
  },
  {
    key: "campus_links",
    label: "Akses Cepat Kampus",
    description: "Tautan praktis menuju portal resmi MyTelU, LMS Tel-U, dan iGracias.",
    visible: true,
    order: 3,
    settings: {
      title: "Akses Cepat Kampus",
      description: "Portal resmi kampus yang paling sering digunakan untuk perkuliahan sehari-hari.",
      links: [
        {
          id: "link-mytelu",
          name: "MyTelU",
          description: "Portal satu pintu layanan mahasiswa dan informasi terpusat Telkom University.",
          url: "https://satu.telkomuniversity.ac.id",
          badge: "SSO",
          iconKey: "mytelu",
          visible: true,
        },
        {
          id: "link-lms",
          name: "LMS Tel-U",
          description: "Learning Management System (CeLOE) untuk presensi, materi, kuis, dan forum diskusi.",
          url: "https://lms.telkomuniversity.ac.id/",
          badge: "CeLOE",
          iconKey: "lms",
          visible: true,
        },
        {
          id: "link-igracias",
          name: "iGracias",
          description: "Sistem informasi akademik resmi untuk registrasi mata kuliah (KRS) dan cek nilai (KHS).",
          url: "https://igracias.telkomuniversity.ac.id",
          badge: "Akademik",
          iconKey: "igracias",
          visible: true,
        },
      ],
    },
  },
  {
    key: "upcoming_tasks",
    label: "Tugas & Deadline Terdekat",
    description: "Pengingat tenggat waktu tugas aktif agar tidak ada yang terlewatkan.",
    visible: true,
    order: 4,
    settings: {
      title: "Tugas & Deadline Terdekat",
      description: "Semua kabar tenggat tugas ada di sini. Selesaikan lebih awal agar waktu luang lebih tenang.",
      maxItems: 4,
      showSubject: true,
      showDeadline: true,
      buttonText: "Lihat Semua Tugas",
    },
  },
  {
    key: "materials",
    label: "Materi Kuliah Terbaru",
    description: "Pratinjau slide, dokumen perkuliahan, dan referensi belajar terbaru yang dibagikan.",
    visible: false,
    order: 5,
    settings: {
      title: "Materi Kuliah Terbaru",
      description: "Slide kuliah dan modul belajar yang dibagikan dosen atau teman sekelas.",
      maxItems: 4,
      buttonText: "Buka Repositori Materi",
    },
  },
  {
    key: "achievements",
    label: "Prestasi Kelas",
    description: "Daftar pencapaian dan kebanggaan mahasiswa kelas di berbagai kompetisi.",
    visible: true,
    order: 6,
    settings: {
      title: "Prestasi & Kebanggaan Kelas",
      description: "Apresiasi atas perjuangan dan prestasi yang berhasil diraih rekan mahasiswa JS1SI-26-REG-05.",
      maxItems: 3,
      layout: "grid",
      buttonText: "Lihat Semua Prestasi",
    },
  },
  {
    key: "students",
    label: "Teman Satu Kelas",
    description: "Daftar rekan mahasiswa satu angkatan di kelas JS1SI-26-REG-05.",
    visible: true,
    order: 7,
    settings: {
      title: "Teman Satu Kelas",
      description: "Kenalan lebih dekat dengan teman sekelas untuk berkolaborasi dan belajar bersama.",
      maxItems: 8,
      showMajor: true,
      buttonText: "Lihat Semua Mahasiswa",
    },
  },
  {
    key: "gallery",
    label: "Galeri Kegiatan Kelas",
    description: "Dokumentasi foto momen kebersamaan, perkuliahan, dan kegiatan kelas.",
    visible: true,
    order: 8,
    settings: {
      title: "Galeri Kegiatan & Momen Kelas",
      description: "Momen seru dan kenangan berharga selama menempuh perjalanan kuliah bersama.",
      maxItems: 6,
      buttonText: "Lihat Semua Foto",
    },
  },
  {
    key: "daily_notes",
    label: "Catatan & Jurnal Kelas",
    description: "Rangkuman materi harian dan notulensi perkuliahan dari teman sekelas.",
    visible: false,
    order: 9,
    settings: {
      title: "Catatan Perkuliahan Harian",
      description: "Catatan penting dan rangkuman materi dari sesi kuliah yang dibagikan teman sekelas.",
      maxItems: 3,
      buttonText: "Buka Catatan Kelas",
    },
  },
  {
    key: "about",
    label: "Tentang Kelas (Teaser)",
    description: "Sorotan singkat visi kelas, nilai utama, dan tautan menuju profil lengkap kelas.",
    visible: false,
    order: 10,
    settings: {
      title: "Mengenal Kelas JS1SI-26-REG-05",
      description: "Komitmen kami untuk saling mendukung, berintegritas tinggi, dan terus berinovasi.",
      showVision: true,
      showLeaders: true,
      buttonText: "Selengkapnya Tentang Kelas",
    },
  },
];

export function getDefaultHomepageConfig(): HomepageConfig {
  return {
    version: 1,
    sections: JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_SECTIONS)),
  };
}

export function getDefaultSectionConfig<K extends SectionKey>(key: K): SectionConfig<K> {
  const found = DEFAULT_HOMEPAGE_SECTIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Section key ${key} is not registered in defaults`);
  }
  return JSON.parse(JSON.stringify(found)) as SectionConfig<K>;
}
