```
# ClassHub — Modern Class & Cohort Management Web Application

<p align="center">
  <strong>A full-stack, production-ready web portal designed for university classes, student cohorts, and academic communities.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-Embedded_PGlite-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Zod-v4-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License" />
</p>

---

## 🌟 Key Features

### 🎓 Public Portal
- **Interactive Home Dashboard (`/`)**: Tampilan ikhtisar interaktif yang memuat jadwal kuliah hari ini, hitung mundur tugas mendesak, sorotan prestasi terbaru, pengumuman terhangat, kartu mahasiswa pilihan, serta momen dokumentasi galeri kelas.
- **Weekly Schedule Timetable (`/schedule`)**: Jadwal kuliah mingguan yang dikelompokkan per hari (Senin – Sabtu) lengkap dengan jam mulai/selesai, kode ruangan, nama dosen pengampu, dan tautan silabus mata kuliah.
- **Coursework & Task Deadlines (`/tasks`)**: Sistem pelacak tugas dengan hitung mundur dinamis dan indikator status otomatis (*Upcoming*, *Due Soon*, *Overdue*, *Completed*) serta filter tingkat prioritas (*High*, *Medium*, *Low*).
- **Student Cohort Directory (`/students`)**: Direktori mahasiswa satu angkatan berupa kartu profil yang memuat foto, NIM, bio singkat, cita-cita karier, portofolio, serta tautan jejaring profesional (GitHub, LinkedIn).
- **Detailed Student Profiles (`/students/[id]`)**: Halaman detail profil individu yang mengulas perjalanan mahasiswa, motivasi, aspirasi karier, serta daftar prestasi individu maupun tim.
- **Hall of Fame & Achievements (`/achievements`)**: Etalase penghargaan dan apresiasi prestasi yang diklasifikasikan ke dalam kategori (Kompetisi, Akademik, Kegiatan Sosial, Teknologi, dan Kepemimpinan) dengan penandaan partisipan mahasiswa.
- **Class Bulletins & Announcements (`/announcements`)**: Papan buletin resmi kelas dengan dukungan teks berformat, status publikasi, dan label kategori informasi.
- **Campus & Activity Gallery (`/gallery`)**: Dokumentasi album foto kenangan dari berbagai kegiatan seperti workshop, kelompok belajar, hackathon, dan makrab angkatan.
- **Shared Class Resources (`/resources`)**: Repositori tautan kurasi terpusat menuju Google Drive resmi, organisasi GitHub Classroom, e-book materi, dan software penunjang kuliah.
- **About Campus & Cohort (`/about`)**: Halaman pengenalan profil kelas/kampus, visi misi, sejarah, serta struktur kepengurusan angkatan.

### 🛡️ Administrative Portal (`/admin`)
- **Executive Dashboard (`/admin`)**: Panel kontrol metrik kunci (total mahasiswa terdaftar, jumlah matakuliah, tugas aktif, rekor prestasi, pengumuman terbit) dilengkapi rekam jejak aktivitas audit (*audit activity logs*).
- **Schedule Management (`/admin/schedule`)**: Manajemen CRUD penuh untuk jadwal jam perkuliahan, alokasi ruangan kelas, dan penugasan dosen pengampu.
- **Tasks & Assignments Management (`/admin/tasks`)**: Membuat dan memperbarui tugas, mengatur tenggat waktu otomatis, serta menandai status penyelesaian tugas mahasiswa.
- **Subjects Curriculum Management (`/admin/subjects`)**: Pengelolaan kurikulum, kode mata kuliah, deskripsi silabus, dan data fakultas/dosen.
- **Student Roster Management (`/admin/students`)**: Manajemen biodata mahasiswa angkatan, pembaruan portofolio, aspirasi karier, dan akun media sosial.
- **Achievements Management (`/admin/achievements`)**: Pencatatan riwayat penghargaan dengan kemampuan menandai banyak mahasiswa sekaligus (*multi-student participant tagging*).
- **Announcements Management (`/admin/announcements`)**: Penulisan draf buletin, kontrol status terbit (*publish toggle*), dan unggah banner grafis.
- **Photo Gallery Management (`/admin/gallery`)**: Kurasi dan kurasi foto kenangan kelas berdasarkan tanggal pelaksanaan acara.
- **Resources Management (`/admin/resources`)**: Manajemen tautan unduhan materi dan repositori belajar berdasarkan kategori subjek.
- **About Page Manager (`/admin/about`)**: Editor konten untuk informasi profil kampus, visi, misi, dan narasi yang tampil di halaman publik.
- **User & Access Management (RBAC) (`/admin/users`)**: Manajemen akun staf administrator, dosen, dan asisten kelas dengan hak akses berbasis peran serta sakelar aktif/nonaktif.
- **Class Settings & Branding (`/admin/settings`)**: Konfigurasi identitas kelas (nama kelas, tahun angkatan, motto/tagline, email kontak resmi, serta kanal komunitas di Discord, Instagram, dan GitHub).

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) | App Router modern, Server Components (RSC) untuk performa cepat, dan Server Actions untuk mutasi data aman. |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict mode dengan jaminan keamanan tipe data penuh (*end-to-end type safety*). |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Engine utility-first CSS generasi terbaru dengan custom design tokens, *glassmorphism*, dan tata letak ultra-responsif. |
| **Database ORM** | [Prisma 6.19](https://www.prisma.io/) | Pemodelan skema relasional deklaratif dengan PostgreSQL adapter dan migration tool. |
| **Database Engine** | [PostgreSQL](https://www.postgresql.org/) | Kompatibel penuh dengan Supabase, Neon Serverless, AWS RDS, Railway, atau instalasi lokal. |
| **Embedded Database** | [PGlite](https://pglite.dev/) | Mesin PostgreSQL embedded lokal (Node.js engine pada port `5433`), memungkinkan sistem berjalan tanpa instalasi Docker/Postgres manual. |
| **Authentication** | [jose](https://github.com/panva/jose) | Autentikasi sesi stateless JWT berbasis cookie berkeamanan tinggi (`httpOnly`, `sameSite=lax`, `secure`). |
| **Validation** | [Zod v4](https://zod.dev/) | Validasi skema input form dan sanitasi data yang sinkron di sisi client maupun server. |
| **UI Components** | [Radix UI Primitives](https://www.radix-ui.com/) | Primitif antarmuka aksesibel (Modal, Select, Toast, Avatar, Separator, Pagination). |
| **Icons** | [Lucide React](https://lucide.dev/) | Paket ikon vektor modern yang ringan dipadu custom SVG Brand Icons (GitHub, Discord, LinkedIn). |
| **Security** | `bcryptjs` | Algoritma hashing password satu arah dengan proteksi middleware Next.js dan guardrail pencegah lockout. |

---

## 🔐 Role-Based Access Control (RBAC)

ClassHub menerapkan pembagian wewenang yang ketat di level middleware dan server action:

| Role | Permissions & Scope |
|---|---|
| **ADMIN** | **Akses Penuh**: Mengelola seluruh pengguna (users), hak akses, pengaturan identitas sistem, data akademik, dan audit log. |
| **CLASS_ADMIN** | **Administrasi Kelas**: Mengelola jadwal perkuliahan, tugas harian, direktori mahasiswa, prestasi, pengumuman, dan galeri. |
| **LECTURER** | **Manajer Akademik**: Mempublikasikan tugas kuliah, pengumuman akademik, dan membagikan tautan modul belajar. |
| **ASSISTANT** | **Asisten Praktikum**: Membantu pembaruan status tugas, jadwal lab/praktikum, dan asistensi direktori mahasiswa. |

### 🔑 Demo Credentials (Offline / First-Time Login)

Gunakan kredensial bawaan hasil proses seeding database berikut untuk pengujian portal admin:

| Peran (Role) | Alamat Email | Password Bawaan | Lingkup Akses Utama |
|---|---|---|---|
| **ADMIN** | `admin@classhub.edu` | `Password123!` | Seluruh Modul + User & Settings |
| **CLASS_ADMIN** | `classadmin@classhub.edu` | `Password123!` | Operasional Kelas & Direktori |
| **LECTURER** | `lecturer@classhub.edu` | `Password123!` | Tugas, Pengumuman, & Resources |
| **ASSISTANT** | `assistant@classhub.edu` | `Password123!` | Status Tugas & Asistensi Jadwal |

---

## 🚀 Getting Started

### 1. Prerequisites
Pastikan lingkungan pengembangan lokal telah terpasang:
- **Node.js** versi `20.x` atau `22.x+` (LTS direkomendasikan)
- **npm** (bawaan Node) atau **pnpm**
- *(Opsional)* PostgreSQL instance eksternal (misal: [Supabase](https://supabase.com), [Neon](https://neon.tech), atau Docker). Jika tidak ada, sistem akan otomatis menggunakan database embedded bawaan.

### 2. Installation
Kloning repositori dan instal seluruh dependensi paket:
```bash
git clone https://github.com/username-anda/ProjectCampus.git
cd ProjectCampus
npm install
```

### 3. Environment Variables
Salin berkas template environment:
```bash
cp .env.example .env
```

Konfigurasikan variabel environment Anda di dalam file `.env`:
```env
# Koneksi Database (Default ke embedded PGlite lokal pada port 5433)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/classhub_db?schema=public"

# Rahasia Enkripsi JWT Sesi (Minimal 32 karakter acak)
AUTH_SECRET="super-secret-jwt-token-key-change-this-in-production-32chars"

# URL Dasar Aplikasi
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

### 4. Database Setup & Migrations
Generate Prisma Client client bindings:
```bash
npx prisma generate
```

Sinkronisasikan skema tabel ke database:
```bash
npx prisma db push
```

Isi database dengan data awal realistis (*seeding*):
```bash
npm run db:seed
```

> **⚡ Zero-Config Local Database Included**:  
> ClassHub dilengkapi mesin PostgreSQL *embedded* yang ditenagai oleh PGlite (`scripts/dev-db.mjs`) pada port `5433`. Menjalankan perintah `npm run dev` secara otomatis menginisialisasi database lokal dan server Next.js sekaligus tanpa memerlukan instalasi Docker atau server PostgreSQL terpisah!
>
> **🛡️ Note on Zero-Downtime Resilience**:  
> Apabila database PostgreSQL mengalami gangguan jaringan atau sedang offline, ClassHub secara pintar beralih membaca lapisan data cadangan (*fallback layer* di `initial-data.ts`). Aplikasi akan tetap berjalan normal tanpa memunculkan layar crash/unhandled exceptions.

### 5. Running Locally
Jalankan server pengembangan:
```bash
npm run dev
```

Buka peramban dan akses: [http://localhost:3000](http://localhost:3000)  
Untuk login ke portal admin, buka: [http://localhost:3000/login](http://localhost:3000/login)

#### Daftar Skrip Pengembangan yang Tersedia:
| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan database embedded PGlite dan server Next.js secara bersamaan. |
| `npm run dev:db` | Menjalankan hanya mesin database PGlite di port 5433. |
| `npm run dev:next` | Menjalankan hanya Next.js (cocok jika menggunakan database cloud eksternal). |
| `npm run db:push` | Mendorong perubahan skema Prisma langsung ke database tanpa file migrasi. |
| `npm run db:seed` | Mengisi database dengan akun staf, jadwal, tugas, dan direktori mahasiswa contoh. |
| `npm run build` | Melakukan kompilasi bundle produksi (*production build*). |
| `npm run start` | Menjalankan aplikasi dalam mode produksi. |
| `npm run lint` | Menjalankan static analysis ESLint untuk mengecek kualitas kode. |

---

## 📁 Project Architecture

```text
ProjectCampus/
├── prisma/
│   ├── schema.prisma              # Definisi skema database, relasi entitas, dan enum RBAC
│   └── seed.ts                    # Skrip pengisian data awal (seeder) akun staf dan jadwal
├── scripts/
│   └── dev-db.mjs                 # Script embedded PostgreSQL engine berbasis PGlite
├── src/
│   ├── app/
│   │   ├── (public)/              # Grup route publik dengan PublicNav & Footer terpadu
│   │   │   ├── layout.tsx         # Layout navigasi publik
│   │   │   ├── page.tsx           # Home landing page & live dashboard
│   │   │   ├── schedule/page.tsx  # Tampilan jadwal kuliah mingguan
│   │   │   ├── tasks/page.tsx     # Tampilan tugas dan tenggat waktu
│   │   │   ├── students/          # Direktori dan detail profil mahasiswa
│   │   │   ├── achievements/      # Galeri penghargaan dan prestasi kelas
│   │   │   ├── announcements/     # Papan pengumuman dan buletin kelas
│   │   │   ├── gallery/           # Album foto kenangan kegiatan kampus
│   │   │   ├── resources/         # Repositori tautan drive, modul, dan tools
│   │   │   └── about/page.tsx     # Profil kelas, visi, misi, dan kepengurusan
│   │   ├── admin/                 # Protected Route: Panel Pengelolaan Administrator
│   │   │   ├── layout.tsx         # Autentikasi server & verifikasi hak akses sesi
│   │   │   ├── layout-client.tsx  # Komponen navigasi sidebar admin yang responsif
│   │   │   ├── page.tsx           # Ringkasan analitik dan metrik eksekutif
│   │   │   ├── schedule/          # Manajemen jadwal kelas dan plot ruangan
│   │   │   ├── tasks/             # Manajemen penugasan dan deadline
│   │   │   ├── subjects/          # Manajemen silabus mata kuliah dan dosen
│   │   │   ├── students/          # Manajemen data biodata mahasiswa
│   │   │   ├── achievements/      # Manajemen pencatatan prestasi
│   │   │   ├── announcements/     # Editor dan publikasi buletin
│   │   │   ├── gallery/           # Pengelola album foto kegiatan
│   │   │   ├── resources/         # Pengelola repositori berkas dan tautan
│   │   │   ├── users/             # Pengelola tim admin, dosen, & kontrol RBAC
│   │   │   ├── about/             # Pengelola konten profil dan visi misi
│   │   │   └── settings/          # Pengaturan identitas kelas dan kanal media sosial
│   │   ├── login/page.tsx         # Halaman autentikasi admin berdesain glassmorphic
│   │   ├── globals.css            # Sistem token desain terpusat Tailwind CSS v4
│   │   └── layout.tsx             # Root layout aplikasi terintegrasi font Inter
│   ├── components/
│   │   ├── public-nav.tsx         # Header navigasi publik responsif dengan mobile drawer
│   │   ├── public-footer.tsx      # Footer multi-kolom terhubung dengan konfigurasi dinamis
│   │   ├── icons.tsx              # Komponen ikon merek SVG (GitHub, Discord, LinkedIn)
│   │   ├── ui/                    # Primitif UI kit (Card, Select, Modal, Toast, Pagination)
│   │   └── admin/                 # Komponen khusus panel admin
│   │       ├── admin-header.tsx   # Header judul dan aksi panel admin yang konsisten
│   │       ├── modal.tsx          # Dialog modal dengan transisi backdrop
│   │       └── delete-dialog.tsx  # Dialog konfirmasi hapus data dengan pending state
│   ├── lib/
│   │   ├── actions/               # Server Actions (Mutasi database & logika bisnis)
│   │   ├── auth/                  # Manajemen enkripsi sesi JWT & hashing password
│   │   ├── data/                  # Lapisan abstraksi data dengan fallback data cadangan
│   │   ├── permissions/           # Definisi matriks izin peran (*RBAC matrix*)
│   │   ├── validations/           # Skema parsing dan validasi data berbasis Zod
│   │   ├── db.ts                  # Inisialisasi koneksi singleton Prisma Client
│   │   └── utils.ts               # Helper format tanggal, kalkulasi deadline, dan merging kelas CSS
│   └── middleware.ts              # Proteksi route otomatis untuk seluruh direktori /admin
└── package.json
```

---

## 🔒 Security Best Practices Implemented

1. **HttpOnly & Secure Session Cookies**: Token autentikasi JWT dienkripsi secara simetris dan hanya dikirimkan melalui cookie bertipe `httpOnly`, `sameSite=lax`, dan `secure` untuk mengeliminasi risiko pencurian token melalui eksploitasi XSS (*Cross-Site Scripting*).
2. **Server-Side Authorization Enforcement**: Setiap mutasi di dalam *Server Action* mewajibkan pemanggilan fungsi `assertPermission(...)` sebelum menjalankan instruksi ke database untuk mencegah bypass wewenang di sisi klien.
3. **Database Guardrails (Anti-Lockout)**: Logika proteksi di sisi server melarang keras penghapusan akun Administrator aktif terakhir agar sistem tidak pernah mengalami penguncian tanpa pengelola.
4. **Input Sanitization & Type Coercion**: Seluruh data yang dikirim melalui formulir divalidasi secara ketat menggunakan skema Zod dengan aturan pemangkasan spasi (*trim*), batas panjang karakter, serta validasi pola format URL.
5. **Zero Secrets in Client Bundles**: Seluruh variabel sensitif (`DATABASE_URL`, `AUTH_SECRET`, kredensial basis data) dilindungi secara mutlak dan tidak pernah bocor ke dalam JavaScript bundle peramban.

---

## 📄 License
Proyek ini bersifat open-source dan didistribusikan di bawah lisensi resmi [MIT License](LICENSE).
```
