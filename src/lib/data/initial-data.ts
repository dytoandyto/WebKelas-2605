import {
  UserRole,
  DayOfWeek,
  TaskType,
  MaterialType,
  TaskPriority,
  TaskStatus,
  AchievementCategory,
  ResourceCategory,
  ArticleStatus,
} from "@prisma/client";

export const initialSettings = {
  className: "JS1SI-26-REG-05",
  classShortName: "SI • 26-05",
  classCode: "JS1SI-26-REG-05",
  institutionName: "Telkom University Jakarta",
  campusName: "Telkom University Jakarta",
  studyProgram: "S1 Sistem Informasi",
  academicYear: "2026/2027",
  semester: "Semester Ganjil 2026/2027",
  waliDosen: "Muhammad Ardiansyah",
  classHeadline: "LEARN. BUILD. GROW. TOGETHER.",
  classDescription: "Academic class hub and digital ecosystem for S1 Sistem Informasi Telkom University Jakarta class JS1SI-26-REG-05.",
  contactEmail: "si2605@telkomuniversity.ac.id",
  logoUrl: "",
  heroImageUrl: "",
  githubUrl: "",
  linkedinUrl: "https://linkedin.com",
  instagramUrl: "https://instagram.com",
  discordUrl: "https://discord.gg",
  classMotto: "LEARN. BUILD. GROW. TOGETHER.",
  aboutAspiration:
    "Selama menjadi mahasiswa Telkom University, saya berharap dapat terus mengembangkan kemampuan di bidang teknologi dan programming, khususnya dalam membangun sistem perangkat lunak yang efisien untuk memecahkan masalah nyata. Saya ingin mendapatkan pengalaman baru melalui berbagai proyek kampus, memperluas relasi, serta belajar berkolaborasi dengan individu dari berbagai latar belakang untuk mengasah kemampuan komunikasi dan problem-solving. Lebih dari sekadar fokus pada akademik, saya ingin menghasilkan karya teknologi yang bermanfaat dan mengaplikasikan nilai-nilai Harmony, Excellence, dan Integrity (HEI), guna mempersiapkan diri menjadi seorang profesional yang tangguh, adaptif, dan kompeten di industri teknologi masa depan.",
  aboutVision:
    "Mewujudkan kelas JS1SI-26-REG-05 sebagai lingkungan akademik yang solid, inovatif, dan berdaya saing tinggi, dengan penguasaan mendalam di bidang sistem enterprise, arsitektur data, dan rekayasa perangkat lunak modern.",
  aboutMission:
    "Membangun atmosfer belajar yang kolaboratif, memperkuat keterampilan teknis dan soft skill, serta aktif berpartisipasi dalam kompetisi akademik dan inovasi digital.",
  aboutValues: JSON.stringify([
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
  ]),
  aboutLeaders: JSON.stringify([
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
  ]),
  aboutWaliDosenMessage:
    "Selamat datang di ruang digital kelas JS1SI-26-REG-05. Mari bersama kita bangun atmosfer perkuliahan yang saling mendukung, penuh integritas, dan siap menjadi talenta sistem informasi unggul untuk masa depan bangsa.",
};

export const initialSubjects = [
  {
    id: "sub-bbk1aab4",
    code: "BBK1AAB4",
    name: "Algoritma dan Pemrograman",
    englishName: "Algorithms and Programming",
    description: "Dasar logika komputasi, struktur data primitif, algoritma pencarian/pengurutan, flowchart, pseudocode, dan implementasi kode terstruktur.",
    sks: 4,
    lecturerName: "Ahmad Ridwan Fauzi",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    color: "from-blue-500 to-indigo-600",
    createdAt: new Date("2026-01-10T00:00:00Z"),
    updatedAt: new Date("2026-01-10T00:00:00Z"),
  },
  {
    id: "sub-bbk1bab3",
    code: "BBK1BAB3",
    name: "Matematika Diskrit",
    englishName: "Discrete Mathematics",
    description: "Logika proposisi, predikat, teori himpunan, relasi biner, fungsi, kombinatorika, teori graf, dan penerapan dalam sistem informasi.",
    sks: 3,
    lecturerName: "Hafidza Safara Zahratunnisa",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    color: "from-purple-500 to-violet-600",
    createdAt: new Date("2026-01-10T00:00:00Z"),
    updatedAt: new Date("2026-01-10T00:00:00Z"),
  },
  {
    id: "sub-bbk1cab3",
    code: "BBK1CAB3",
    name: "Matematika untuk Sistem Informasi",
    englishName: "Mathematics for Information System",
    description: "Aljabar linier terapan, kalkulus dasar diferensial & integral untuk optimasi data, vektor matriks, dan probabilitas dalam komputasi bisnis.",
    sks: 3,
    lecturerName: "Novyta",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    color: "from-emerald-500 to-teal-600",
    createdAt: new Date("2026-01-10T00:00:00Z"),
    updatedAt: new Date("2026-01-10T00:00:00Z"),
  },
  {
    id: "sub-bbk1dab3",
    code: "BBK1DAB3",
    name: "Pengantar Sistem Informasi",
    englishName: "Introduction to Information Systems",
    description: "Konsep dasar SI/TI dalam organisasi, tata kelola data, e-business, siklus hidup pengembangan sistem, dan etika profesi informasi.",
    sks: 3,
    lecturerName: "Puspita Parahita Anindita",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    color: "from-cyan-500 to-sky-600",
    createdAt: new Date("2026-01-10T00:00:00Z"),
    updatedAt: new Date("2026-01-10T00:00:00Z"),
  },
  {
    id: "sub-bbk1eab3",
    code: "BBK1EAB3",
    name: "Sistem Enterprise",
    englishName: "Enterprise Systems",
    description: "Arsitektur enterprise resource planning (ERP), integrasi proses rantai pasok (SCM), CRM, dan tata kelola sistem skala besar.",
    sks: 3,
    lecturerName: "Putri Utami Rukmana",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    color: "from-amber-500 to-orange-600",
    createdAt: new Date("2026-01-10T00:00:00Z"),
    updatedAt: new Date("2026-01-10T00:00:00Z"),
  },
  {
    id: "sub-uck1fdb1",
    code: "UCK1FDB1",
    name: "Internalisasi Budaya dan Pembentukan Karakter",
    englishName: "Cultural Internalization and Character Formation",
    description: "Penguatan nilai HEI (Harmony, Excellence, Integrity), etika akademik, kepemimpinan adaptif, dan karakter unggul mahasiswa Telkom University.",
    sks: 1,
    lecturerName: "Muhammad Ardiansyah",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    color: "from-rose-500 to-pink-600",
    createdAt: new Date("2026-01-10T00:00:00Z"),
    updatedAt: new Date("2026-01-10T00:00:00Z"),
  },
  {
    id: "sub-uakkacb2",
    code: "UAKXACB2",
    name: "Agama Islam",
    englishName: "Islamic Religion",
    description: "Pondasi akidah, syariat, akhlak mulia, serta integrasi nilai-nilai keislaman dalam pengembangan teknologi dan sains kemasyarakatan.",
    sks: 2,
    lecturerName: "Ardi Ardiansyah",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    color: "from-teal-500 to-emerald-600",
    createdAt: new Date("2026-01-10T00:00:00Z"),
    updatedAt: new Date("2026-01-10T00:00:00Z"),
  },
];

export const initialSchedules = [
  {
    id: "sch-1",
    subjectId: "sub-bbk1aab4",
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: "07:30",
    endTime: "11:30",
    room: "RLC.KJ.05.001",
    lecturerName: "Ahmad Ridwan Fauzi",
    className: "JS1SI-26-REG-05",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    notes: "Bawa laptop untuk praktikum algoritma dasar dan compiler",
    createdAt: new Date("2026-01-12T00:00:00Z"),
    updatedAt: new Date("2026-01-12T00:00:00Z"),
    subject: initialSubjects[0],
  },
  {
    id: "sch-2",
    subjectId: "sub-bbk1eab3",
    dayOfWeek: DayOfWeek.TUESDAY,
    startTime: "09:30",
    endTime: "12:30",
    room: "RLC.KJ.05.002",
    lecturerName: "Putri Utami Rukmana",
    className: "JS1SI-26-REG-05",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    notes: "Kuliah teori arsitektur ERP dan studi kasus proses bisnis",
    createdAt: new Date("2026-01-12T00:00:00Z"),
    updatedAt: new Date("2026-01-12T00:00:00Z"),
    subject: initialSubjects[4],
  },
  {
    id: "sch-3",
    subjectId: "sub-bbk1bab3",
    dayOfWeek: DayOfWeek.WEDNESDAY,
    startTime: "07:30",
    endTime: "10:30",
    room: "RKC.KJ.03.002",
    lecturerName: "Hafidza Safara Zahratunnisa",
    className: "JS1SI-26-REG-05",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    notes: "Pembahasan latihan soal logika proposisi & tabel kebenaran",
    createdAt: new Date("2026-01-12T00:00:00Z"),
    updatedAt: new Date("2026-01-12T00:00:00Z"),
    subject: initialSubjects[1],
  },
  {
    id: "sch-4",
    subjectId: "sub-bbk1cab3",
    dayOfWeek: DayOfWeek.WEDNESDAY,
    startTime: "10:30",
    endTime: "13:30",
    room: "RKC.KJ.04.001",
    lecturerName: "Novyta",
    className: "JS1SI-26-REG-05",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    notes: "Aljabar matriks dan kalkulus sistem informasi",
    createdAt: new Date("2026-01-12T00:00:00Z"),
    updatedAt: new Date("2026-01-12T00:00:00Z"),
    subject: initialSubjects[2],
  },
  {
    id: "sch-5",
    subjectId: "sub-uck1fdb1",
    dayOfWeek: DayOfWeek.THURSDAY,
    startTime: "14:30",
    endTime: "15:30",
    room: "RLC.KJ.03.003",
    lecturerName: "Muhammad Ardiansyah",
    className: "JS1SI-26-REG-05",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    notes: "Sesi pembentukan karakter HEI dan etika kampus",
    createdAt: new Date("2026-01-12T00:00:00Z"),
    updatedAt: new Date("2026-01-12T00:00:00Z"),
    subject: initialSubjects[5],
  },
  {
    id: "sch-6",
    subjectId: "sub-bbk1dab3",
    dayOfWeek: DayOfWeek.FRIDAY,
    startTime: "08:30",
    endTime: "10:30",
    room: "RLC.KJ.03.003",
    lecturerName: "Puspita Parahita Anindita",
    className: "JS1SI-26-REG-05",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    notes: "Presentasi studi kasus sistem informasi e-commerce",
    createdAt: new Date("2026-01-12T00:00:00Z"),
    updatedAt: new Date("2026-01-12T00:00:00Z"),
    subject: initialSubjects[3],
  },
  {
    id: "sch-7",
    subjectId: "sub-uakkacb2",
    dayOfWeek: DayOfWeek.SATURDAY,
    startTime: "07:30",
    endTime: "09:30",
    room: "RKC.KJ.03.001",
    lecturerName: "Ardi Ardiansyah",
    className: "JS1SI-26-REG-05",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    notes: "Kajian nilai etika dan moralitas dalam profesi digital",
    createdAt: new Date("2026-01-12T00:00:00Z"),
    updatedAt: new Date("2026-01-12T00:00:00Z"),
    subject: initialSubjects[6],
  },
];

export const initialTasks: any[] = [];
export const initialMaterials: any[] = [];

export const initialArticles = [
  {
    id: "art-erp-arch",
    title: "Panduan Arsitektur Sistem Enterprise & Integrasi ERP Modern",
    slug: "panduan-arsitektur-sistem-enterprise-erp-modern",
    excerpt: "Bedah mendalam konsep Enterprise Resource Planning (ERP), arsitektur modular SAP & Odoo, serta strategi integrasi rantai pasok (SCM) dan CRM pada skala industri.",
    content: `## 1. Pengantar Sistem Enterprise

Sistem Enterprise (**Enterprise Systems**) merupakan tulang punggung operasional organisasi modern. Di era transformasi digital, integrasi lintas departemen bukan lagi sekadar pilihan, melainkan keharusan strategis.

> **Definisi Kunci:**
> Enterprise Resource Planning (ERP) adalah paket perangkat lunak komprehensif yang mengintegrasikan seluruh proses bisnis inti suatu perusahaan—mulai dari manufaktur, keuangan, sumber daya manusia, hingga rantai pasok—ke dalam satu basis data terpusat.

### Karakteristik Utama ERP Modern:
1. **Basis Data Terpadu (Single Source of Truth):** Seluruh departemen mengakses data transaksi yang sama secara real-time.
2. **Proses Bisnis Terstandarisasi:** Mengadopsi *best practices* industri internasional.
3. **Arsitektur Modular:** Kemampuan mengaktifkan modul sesuai pertumbuhan skala bisnis.
4. **Skalabilitas Cloud:** Mendukung *multi-tenant SaaS* dengan replikasi lintas region.

---

## 2. Struktur Modul Inti

Dalam penerapan nyata (misalnya pada SAP S/4HANA atau Odoo Enterprise), sistem dibagi ke dalam modul fungsional:

| Modul | Singkatan | Peran Utama |
|---|---|---|
| **Financial Accounting** | FI / ACC | Pelaporan neraca, laba-rugi, dan kepatuhan audit perpajakan |
| **Material Management** | MM / INV | Pengadaan bahan baku, manajemen gudang, dan stok minimum |
| **Sales & Distribution** | SD / CRM | Order penjualan, invoicing, delivery note, dan riwayat pelanggan |
| **Human Capital** | HR / HCM | Penggajian (payroll), absensi, KPI, dan rekrutmen |

---

## 3. Integrasi API & Aliran Data Real-Time

Arsitektur enterprise modern menggunakan pola *Event-Driven Architecture* (EDA) dengan antrean pesan (message broker) untuk menjamin keandalan data antar subsistem:

\`\`\`typescript
// Contoh implementasi handler webhook integrasi modul Sales ke Inventory
export async function handleSalesOrderConfirmed(order: SalesOrder) {
  // 1. Validasi saldo kredit pelanggan
  const isCreditApproved = await creditService.verifyLimit(order.customerId, order.totalAmount);
  if (!isCreditApproved) {
    throw new Error("Credit limit exceeded for customer: " + order.customerId);
  }

  // 2. Alokasikan stok pada gudang terdekat
  const allocation = await inventoryService.reserveStock({
    items: order.lineItems,
    priority: "HIGH",
    referenceId: order.orderNumber,
  });

  // 3. Picu jurnal akuntansi otomatis (Piutang Usaha vs Pendapatan)
  await generalLedgerService.postJournalEntry({
    debitAccount: "110-100-AR",
    creditAccount: "410-100-REV",
    amount: order.totalAmount,
    currency: "IDR",
    timestamp: new Date(),
  });

  return { status: "SUCCESS", allocationId: allocation.id };
}
\`\`\`

---

## 4. Kesimpulan & Arah Pembelajaran

Menguasai arsitektur sistem enterprise membekali lulusan Sistem Informasi Telkom University kemampuan untuk menjadi **Solution Architect**, **ERP Consultant**, maupun **Business Process Analyst** yang siap bersaing di kancah global.`,
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    status: ArticleStatus.PUBLISHED,
    isFeatured: true,
    readingTime: 5,
    tags: "Sistem Enterprise, ERP, Arsitektur SI, SAP, Odoo",
    subjectId: "sub-bbk1eab3",
    authorId: "usr-admin",
    publishedAt: new Date("2026-02-01T08:00:00Z"),
    createdAt: new Date("2026-02-01T08:00:00Z"),
    updatedAt: new Date("2026-02-01T08:00:00Z"),
    subject: initialSubjects[3],
    author: { id: "usr-admin", name: "SuperAdmin", role: UserRole.ADMIN },
    resources: [],
    notes: [],
  },
  {
    id: "art-bst-algo",
    title: "Struktur Data Pohon Biner & Penerapannya dalam Algoritma Pencarian",
    slug: "struktur-data-pohon-biner-algoritma-pencarian",
    excerpt: "Memahami konsep Binary Search Tree (BST), traversal in-order, pre-order, post-order, dan analisis kompleksitas waktu O(log n) dalam struktur data relasional.",
    content: `## 1. Konsep Dasar Pohon Biner

Pohon Biner (**Binary Tree**) adalah struktur data non-linear di mana setiap simpul (*node*) memiliki paling banyak dua anak, yang lazim disebut sebagai *left child* dan *right child*.

### Aturan Binary Search Tree (BST):
- Nilai seluruh simpul pada sub-pohon kiri **selalu lebih kecil** dari simpul induk.
- Nilai seluruh simpul pada sub-pohon kanan **selalu lebih besar** dari simpul induk.
- Tidak diperkenankan adanya duplikasi nilai simpul pada BST standar.

---

## 2. Kompleksitas Operasi

| Operasi | Rata-rata (Average Case) | Terburuk (Worst Case) |
|---|---|---|
| **Search (Pencarian)** | O(log n) | O(n) *(saat skewed tree)* |
| **Insert (Penyisipan)** | O(log n) | O(n) |
| **Delete (Penghapusan)** | O(log n) | O(n) |

> **Catatan Algoritma:**
> Untuk mencegah kondisi terburuk O(n) ketika pohon condong (*skewed*), struktur data modern menggunakan pohon seimbang seperti **AVL Tree** atau **Red-Black Tree**.

---

## 3. Implementasi Traversal pada C# / TypeScript

\`\`\`csharp
public class TreeNode
{
    public int Value;
    public TreeNode? Left;
    public TreeNode? Right;

    public TreeNode(int value)
    {
        Value = value;
        Left = null;
        Right = null;
    }
}

// Rekursi penelusuran In-Order (Kiri -> Induk -> Kanan)
public static void InOrderTraversal(TreeNode? node)
{
    if (node == null) return;
    InOrderTraversal(node.Left);
    Console.Write(node.Value + " ");
    InOrderTraversal(node.Right);
}
\`\`\`

Hasil dari *In-Order Traversal* pada BST selalu menghasilkan urutan data terurut menaik (*ascending*).`,
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    status: ArticleStatus.PUBLISHED,
    isFeatured: false,
    readingTime: 4,
    tags: "Algoritma, BST, Data Structure, AlPro",
    subjectId: "sub-bbk1aab4",
    authorId: "usr-admin",
    publishedAt: new Date("2026-02-05T09:30:00Z"),
    createdAt: new Date("2026-02-05T09:30:00Z"),
    updatedAt: new Date("2026-02-05T09:30:00Z"),
    subject: initialSubjects[0],
    author: { id: "usr-admin", name: "SuperAdmin", role: UserRole.ADMIN },
    resources: [],
    notes: [],
  },
  {
    id: "art-db-norm",
    title: "Normalisasi Basis Data Relasional: Dari 1NF hingga BCNF Tanpa Pusing",
    slug: "normalisasi-basis-data-relasional-1nf-sampai-bcnf",
    excerpt: "Langkah terstruktur mengeliminasi anomali penyisipan, penghapusan, dan pembaruan pada skema basis data relasional sistem informasi bisnis.",
    content: `## Mengapa Normalisasi Diperlukan?

Dalam perancangan basis data sistem informasi, tabel yang tidak ternormalisasi rentan terhadap tiga anomali fatal:
1. **Insertion Anomaly:** Kesulitan menyisipkan data entitas baru tanpa atribut entitas lain.
2. **Deletion Anomaly:** Kehilangan data krusial secara tidak sengaja saat menghapus rekaman terkait.
3. **Update Anomaly:** Inkonsistensi data ketika satu fakta disimpan berulang di banyak baris.

---

## Tahapan Bentuk Normal

### 1. Bentuk Normal Pertama (1NF)
- Setiap kolom hanya berisi nilai atomik (tunggal).
- Tidak ada grup kolom yang berulang (*repeating groups*).

### 2. Bentuk Normal Kedua (2NF)
- Memenuhi kriteria 1NF.
- Setiap atribut non-kunci harus bergantung penuh secara fungsional pada *Primary Key* (**No Partial Dependency**).

### 3. Bentuk Normal Ketiga (3NF)
- Memenuhi kriteria 2NF.
- Tidak ada ketergantungan transitif antar atribut non-kunci (**No Transitive Dependency**).

---

## Ringkasan Praktis untuk Ujian & Proyek

Pastikan setiap relasi memegang prinsip:
> *"Every non-key attribute must depend on the key, the whole key, and nothing but the key, so help me Codd."*`,
    coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop",
    status: ArticleStatus.PUBLISHED,
    isFeatured: false,
    readingTime: 6,
    tags: "Database, Normalisasi, SQL, RDBMS, Data Modeling",
    subjectId: "sub-bbk1dab3",
    authorId: "usr-admin",
    publishedAt: new Date("2026-02-08T11:00:00Z"),
    createdAt: new Date("2026-02-08T11:00:00Z"),
    updatedAt: new Date("2026-02-08T11:00:00Z"),
    subject: initialSubjects[2],
    author: { id: "usr-admin", name: "SuperAdmin", role: UserRole.ADMIN },
    resources: [],
    notes: [],
  },
];

export const initialDailyNotes = [
  {
    id: "note-erp-w4",
    title: "Review Kuliah Minggu ke-4: Siklus Hidup ERP & Modul Finansial",
    date: new Date("2026-02-02T08:00:00Z"),
    summary: "Rangkuman sesi tatap muka seputar perbandingan pendekatan Big Bang vs Phased rollout dalam implementasi ERP perusahaan manufaktur.",
    content: `Pada pertemuan hari ini, Bu Putri Utami membahas secara mendalam:
1. Tahapan penentuan scope project ERP dan pentingnya Business Blueprint.
2. Pemetaan modul Financial Accounting (FI) terhadap PSAK di Indonesia.
3. Manajemen perubahan (Change Management) sebagai faktor penentu keberhasilan 70% proyek ERP.`,
    importantPoints: "• Big Bang berisiko tinggi namun cepat selesai\n• Phased rollout lebih aman bagi operasional yang kompleks\n• Data migration harus divalidasi ganda",
    nextSteps: "Membaca artikel panduan arsitektur ERP dan menyiapkan proposal studi kasus kelompok.",
    subjectId: "sub-bbk1eab3",
    authorId: "usr-admin",
    articleId: "art-erp-arch",
    tags: "ERP, Keuangan, Implementation",
    createdAt: new Date("2026-02-02T08:00:00Z"),
    updatedAt: new Date("2026-02-02T08:00:00Z"),
    subject: initialSubjects[3],
    author: { id: "usr-admin", name: "SuperAdmin", role: UserRole.ADMIN },
    materials: [],
    tasks: [],
  },
  {
    id: "note-bst-alpro",
    title: "Catatan Lab: Traversal Pohon Biner & Rekursi C#",
    date: new Date("2026-02-06T10:00:00Z"),
    summary: "Praktek langsung di lab komputer mengimplementasikan class Node dan fungsi cetak in-order traversal.",
    content: `Catatan penting praktikum:
- Rekursi membutuhkan base-case yang jelas (node == null) agar tidak terjadi StackOverflowException.
- Urutan pemanggilan in-order: telusuri Left -> cetak Value -> telusuri Right.`,
    importantPoints: "• In-order menghasilkan data terurut\n• Gunakan class TreeNode terpisah",
    nextSteps: "Kerjakan modul latihan 4 pohon biner seimbang.",
    subjectId: "sub-bbk1aab4",
    authorId: "usr-admin",
    articleId: "art-bst-algo",
    tags: "AlPro, C#, Tree, Praktikum",
    createdAt: new Date("2026-02-06T10:00:00Z"),
    updatedAt: new Date("2026-02-06T10:00:00Z"),
    subject: initialSubjects[0],
    author: { id: "usr-admin", name: "SuperAdmin", role: UserRole.ADMIN },
    materials: [],
    tasks: [],
  },
];

export const initialResources = [
  {
    id: "res-erp-slides",
    title: "Slide Kuliah Bab 4: Arsitektur ERP & Data Warehouse (PDF)",
    description: "Materi presentasi resmi dosen pengampu untuk pengenalan modul enterprise dan arsitektur database terpusat.",
    url: "https://drive.google.com/file/d/1erp-sample-id-classhub/view",
    category: ResourceCategory.ACADEMIC,
    subjectId: "sub-bbk1eab3",
    createdBy: "usr-admin",
    createdAt: new Date("2026-02-01T08:00:00Z"),
    updatedAt: new Date("2026-02-01T08:00:00Z"),
  },
  {
    id: "res-pg-docs",
    title: "Dokumentasi Resmi PostgreSQL: Execution Plan & Indexing Guide",
    description: "Referensi teknis resmi untuk analisis EXPLAIN ANALYZE dan pemilihan tipe indeks B-Tree serta GIN pada database relasional.",
    url: "https://www.postgresql.org/docs/current/indexes.html",
    category: ResourceCategory.REFERENCE,
    subjectId: "sub-bbk1dab3",
    createdBy: "usr-admin",
    createdAt: new Date("2026-02-05T08:00:00Z"),
    updatedAt: new Date("2026-02-05T08:00:00Z"),
  },
  {
    id: "res-celo-portal",
    title: "Portal LMS CeLO Telkom University",
    description: "Sistem manajemen pembelajaran resmi Telkom University untuk absensi, kuis daring, dan materi kuliah mingguan.",
    url: "https://celo.telkomuniversity.ac.id",
    category: ResourceCategory.IMPORTANT_LINK,
    subjectId: null,
    createdBy: "usr-admin",
    createdAt: new Date("2026-01-15T08:00:00Z"),
    updatedAt: new Date("2026-01-15T08:00:00Z"),
  },
];

export const initialStudents: any[] = [];
export const initialAchievements: any[] = [];
export const initialAnnouncements: any[] = [];
export const initialGallery: any[] = [];

export const initialUsers = [
  {
    id: "usr-admin",
    name: "SuperAdmin",
    email: "admin@classhub.edu",
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
];

export const initialClassEvents: any[] = [];
export const initialActivityLogs: any[] = [];

