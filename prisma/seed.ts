import {
  PrismaClient,
  UserRole,
  DayOfWeek,
  TaskType,
  MaterialType,
  TaskPriority,
  TaskStatus,
  AchievementCategory,
  ResourceCategory,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Telkom University Jakarta (JS1SI-26-REG-05) database seed...");

  // 1. Clean existing records in dependency order
  await prisma.activityLog.deleteMany();
  await prisma.studentAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.dailyNoteMaterial.deleteMany();
  await prisma.dailyNoteTask.deleteMany();
  await prisma.dailyNote.deleteMany();
  await prisma.material.deleteMany();
  await prisma.task.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // 2. Hash default passwords
  const adminPassword = await bcrypt.hash("AdminClassHub2026!", 12);
  const classAdminPassword = await bcrypt.hash("ClassAdmin2026!", 12);
  const lecturerPassword = await bcrypt.hash("Lecturer2026!", 12);
  const assistantPassword = await bcrypt.hash("Assistant2026!", 12);

  // 3. Create Administrative Users
  console.log("Creating administrative users...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Muhammad Ardiansyah (Wali Dosen)",
      email: "ardiansyah@telkomuniversity.ac.id",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const classAdminUser = await prisma.user.create({
    data: {
      name: "Ketua Kelas JS1SI-26-REG-05",
      email: "classadmin@telkomuniversity.ac.id",
      passwordHash: classAdminPassword,
      role: UserRole.CLASS_ADMIN,
      isActive: true,
    },
  });

  const lecturerUser = await prisma.user.create({
    data: {
      name: "Budi Santoso, S.Kom., M.T.",
      email: "budisantoso@telkomuniversity.ac.id",
      passwordHash: lecturerPassword,
      role: UserRole.LECTURER,
      isActive: true,
    },
  });

  const assistantUser = await prisma.user.create({
    data: {
      name: "Asisten Lab SI Tel-U",
      email: "asisten.si@telkomuniversity.ac.id",
      passwordHash: assistantPassword,
      role: UserRole.ASSISTANT,
      isActive: true,
    },
  });

  // 4. Create Settings (Exact Class Identity)
  console.log("Configuring class identity settings...");
  const settingsData = [
    { key: "className", value: "JS1SI-26-REG-05" },
    { key: "classShortName", value: "SI • 26-05" },
    { key: "classCode", value: "JS1SI-26-REG-05" },
    { key: "institutionName", value: "Telkom University Jakarta" },
    { key: "campusName", value: "Telkom University Jakarta" },
    { key: "studyProgram", value: "S1 Sistem Informasi" },
    { key: "academicYear", value: "2026/2027" },
    { key: "semester", value: "Semester Ganjil 2026/2027" },
    { key: "waliDosen", value: "Muhammad Ardiansyah" },
    { key: "classHeadline", value: "LEARN. BUILD. GROW. TOGETHER." },
    { key: "classDescription", value: "Academic class hub and digital ecosystem for S1 Sistem Informasi Telkom University Jakarta class JS1SI-26-REG-05." },
    { key: "contactEmail", value: "si2605@telkomuniversity.ac.id" },
    { key: "githubUrl", value: "https://github.com/dytoandyto/WebKelas-2605" },
    { key: "instagramUrl", value: "https://instagram.com/telkomuniversity_jakarta" },
    { key: "discordUrl", value: "https://discord.gg/telkomuniversity" },
    { key: "classMotto", value: "LEARN. BUILD. GROW. TOGETHER." },
  ];

  for (const s of settingsData) {
    await prisma.setting.create({ data: s });
  }

  // 5. Create 7 Exact Subjects
  console.log("Creating curriculum subjects...");
  const subAlgoritma = await prisma.subject.create({
    data: {
      code: "BBK1AAB4",
      name: "Algoritma dan Pemrograman",
      englishName: "Algorithms and Programming",
      description: "Dasar logika komputasi, struktur data primitif, algoritma pencarian/pengurutan, flowchart, pseudocode, dan implementasi kode terstruktur.",
      sks: 4,
      lecturerName: "Muhammad Ardiansyah, S.Kom., M.Kom.",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-blue-500 to-indigo-600",
    },
  });

  const subEnterprise = await prisma.subject.create({
    data: {
      code: "BBK1EAB3",
      name: "Sistem Enterprise",
      englishName: "Enterprise Systems",
      description: "Arsitektur enterprise resource planning (ERP), integrasi proses rantai pasok (SCM), CRM, dan tata kelola sistem skala besar.",
      sks: 3,
      lecturerName: "Budi Santoso, S.Kom., M.T.",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-amber-500 to-orange-600",
    },
  });

  const subDiskrit = await prisma.subject.create({
    data: {
      code: "BBK1BAB3",
      name: "Matematika Diskrit",
      englishName: "Discrete Mathematics",
      description: "Logika proposisi, predikat, teori himpunan, relasi biner, fungsi, kombinatorika, teori graf, dan penerapan dalam sistem informasi.",
      sks: 3,
      lecturerName: "Drs. Hendra Wijaya, M.Si.",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-purple-500 to-violet-600",
    },
  });

  const subMatematikaSI = await prisma.subject.create({
    data: {
      code: "BBK1CAB3",
      name: "Matematika untuk Sistem Informasi",
      englishName: "Mathematics for Information System",
      description: "Aljabar linier terapan, kalkulus dasar diferensial & integral untuk optimasi data, vektor matriks, dan probabilitas dalam komputasi bisnis.",
      sks: 3,
      lecturerName: "Dr. Rina Astuti, M.Sc.",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-emerald-500 to-teal-600",
    },
  });

  const subPengantarSI = await prisma.subject.create({
    data: {
      code: "BBK1DAB3",
      name: "Pengantar Sistem Informasi",
      englishName: "Introduction to Information Systems",
      description: "Konsep dasar SI/TI dalam organisasi, tata kelola data, e-business, siklus hidup pengembangan sistem, dan etika profesi informasi.",
      sks: 3,
      lecturerName: "Fitri Ramadhani, S.T., M.M.",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-cyan-500 to-sky-600",
    },
  });

  const subKarakter = await prisma.subject.create({
    data: {
      code: "UCK1FDB1",
      name: "Internalisasi Budaya dan Pembentukan Karakter",
      englishName: "Cultural Internalization and Character Formation",
      description: "Penguatan nilai HEI (Harmony, Excellence, Integrity), etika akademik, kepemimpinan adaptif, dan karakter unggul mahasiswa Telkom University.",
      sks: 1,
      lecturerName: "Tim Dosen Karakter Tel-U",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-rose-500 to-pink-600",
    },
  });

  const subAgama = await prisma.subject.create({
    data: {
      code: "UAKXACB2",
      name: "Agama Islam",
      englishName: "Islamic Religion",
      description: "Pondasi akidah, syariat, akhlak mulia, serta integrasi nilai-nilai keislaman dalam pengembangan teknologi dan sains kemasyarakatan.",
      sks: 2,
      lecturerName: "Ust. Ahmad Fauzi, M.Ag.",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-teal-500 to-emerald-600",
    },
  });

  // 6. Create 7 Exact Class Schedules
  console.log("Creating timetable schedules with exact rooms...");
  await prisma.schedule.createMany({
    data: [
      {
        subjectId: subAlgoritma.id,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: "07:30",
        endTime: "11:30",
        room: "RLC.KJ.05.001",
        lecturerName: "Muhammad Ardiansyah, S.Kom., M.Kom.",
        className: "JS1SI-26-REG-05",
        notes: "Bawa laptop untuk praktikum algoritma dasar dan compiler",
      },
      {
        subjectId: subEnterprise.id,
        dayOfWeek: DayOfWeek.TUESDAY,
        startTime: "09:30",
        endTime: "12:30",
        room: "RLC.KJ.05.002",
        lecturerName: "Budi Santoso, S.Kom., M.T.",
        className: "JS1SI-26-REG-05",
        notes: "Kuliah teori arsitektur ERP dan studi kasus proses bisnis",
      },
      {
        subjectId: subDiskrit.id,
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: "07:30",
        endTime: "10:30",
        room: "RKC.KJ.03.002",
        lecturerName: "Drs. Hendra Wijaya, M.Si.",
        className: "JS1SI-26-REG-05",
        notes: "Pembahasan latihan soal logika proposisi & tabel kebenaran",
      },
      {
        subjectId: subMatematikaSI.id,
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: "10:30",
        endTime: "13:30",
        room: "RKC.KJ.04.001",
        lecturerName: "Dr. Rina Astuti, M.Sc.",
        className: "JS1SI-26-REG-05",
        notes: "Aljabar matriks dan kalkulus sistem informasi",
      },
      {
        subjectId: subKarakter.id,
        dayOfWeek: DayOfWeek.THURSDAY,
        startTime: "14:30",
        endTime: "15:30",
        room: "RLC.KJ.03.003",
        lecturerName: "Tim Dosen Karakter Tel-U",
        className: "JS1SI-26-REG-05",
        notes: "Sesi pembentukan karakter HEI dan etika kampus",
      },
      {
        subjectId: subPengantarSI.id,
        dayOfWeek: DayOfWeek.FRIDAY,
        startTime: "08:30",
        endTime: "10:30",
        room: "RLC.KJ.03.003",
        lecturerName: "Fitri Ramadhani, S.T., M.M.",
        className: "JS1SI-26-REG-05",
        notes: "Presentasi studi kasus sistem informasi e-commerce",
      },
      {
        subjectId: subAgama.id,
        dayOfWeek: DayOfWeek.SATURDAY,
        startTime: "07:30",
        endTime: "09:30",
        room: "RKC.KJ.03.001",
        lecturerName: "Ust. Ahmad Fauzi, M.Ag.",
        className: "JS1SI-26-REG-05",
        notes: "Kajian nilai etika dan moralitas dalam profesi digital",
      },
    ],
  });

  // 7. Create Realistic Academic Tasks with LMS Links
  console.log("Creating academic reminder tasks with LMS links...");
  const now = new Date();
  const inToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const inSixDays = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const inTenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const task1 = await prisma.task.create({
    data: {
      subjectId: subAlgoritma.id,
      title: "Praktikum Modul 3: Pseudocode & Flowchart Algoritma Pencarian",
      description: "Susun notasi algoritmik terstruktur dan flowchart untuk algoritma Binary Search vs Linear Search pada kumpulan data mahasiswa.",
      taskType: TaskType.INDIVIDUAL,
      deadline: inThreeDays,
      priority: TaskPriority.HIGH,
      status: TaskStatus.DUE_SOON,
      submissionUrl: "https://lms.telkomuniversity.ac.id/mod/assign/view.php?id=101234",
      referenceUrl: "https://lms.telkomuniversity.ac.id/course/view.php?id=2605",
      notes: "Kumpulkan file PDF laporan praktikum sesuai template resmi Tel-U.",
      createdBy: adminUser.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      subjectId: subEnterprise.id,
      title: "Studi Kasus Analisis Integrasi ERP & Business Process",
      description: "Analisis studi kasus implementasi modul Supply Chain Management (SCM) dan Financial ERP pada perusahaan FMCG terkemuka.",
      taskType: TaskType.GROUP,
      deadline: inSixDays,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.UPCOMING,
      groupName: "Kelompok 2 - Enterprise Core",
      groupMembers: "Dyto, Sarah, David, Amanda",
      submissionUrl: "https://lms.telkomuniversity.ac.id/mod/assign/view.php?id=101235",
      notes: "Sertakan diagram BPMN proses bisnis sebelum dan sesudah integrasi ERP.",
      createdBy: lecturerUser.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      subjectId: subDiskrit.id,
      title: "Latihan Soal Mandiri: Relasi Ekuivalensi & Teori Graf",
      description: "Kerjakan 10 soal pembuktian relasi ekuivalensi, graf berarah, serta algoritma Dijkstra pada buku pegangan Matematika Diskrit.",
      taskType: TaskType.INDIVIDUAL,
      deadline: inTenDays,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.UPCOMING,
      submissionUrl: "https://lms.telkomuniversity.ac.id/mod/assign/view.php?id=101236",
      createdBy: lecturerUser.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      subjectId: subPengantarSI.id,
      title: "Tugas Pengayaan: Makalah Tren AI & Transformasi Digital",
      description: "Tugas tambahan pengayaan materi: Ulas dampak GenAI terhadap arsitektur sistem informasi modern dalam industri perbankan.",
      taskType: TaskType.ADDITIONAL,
      deadline: inToday,
      priority: TaskPriority.LOW,
      status: TaskStatus.UPCOMING,
      submissionUrl: "https://lms.telkomuniversity.ac.id/mod/assign/view.php?id=101237",
      createdBy: adminUser.id,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      subjectId: subKarakter.id,
      title: "Refleksi Karakter HEI (Harmony, Excellence, Integrity)",
      description: "Tuliskan esai refleksi pribadi mengenai penerapan nilai Integrity dalam kolaborasi proyek teknologi informasi.",
      taskType: TaskType.INDIVIDUAL,
      deadline: twoDaysAgo,
      priority: TaskPriority.HIGH,
      status: TaskStatus.OVERDUE,
      submissionUrl: "https://lms.telkomuniversity.ac.id/mod/assign/view.php?id=101238",
      createdBy: adminUser.id,
    },
  });

  // 8. Create Learning Materials
  console.log("Creating course learning materials...");
  const matAlgo1 = await prisma.material.create({
    data: {
      title: "Slide Kuliah Pertemuan 1 - Konsep Algoritma & Flowchart",
      description: "Materi presentasi pengenalan dasar logika algoritma, simbol-simbol flowchart standar ANSI, dan pseudocode.",
      subjectId: subAlgoritma.id,
      type: MaterialType.PDF,
      fileName: "BBK1AAB4_Pertemuan_01_Logika_Algoritma.pdf",
      fileUrl: "https://raw.githubusercontent.com/dytoandyto/WebKelas-2605/main/public/materials/BBK1AAB4_Modul_01.pdf",
      fileSize: "2.8 MB",
      tags: "algoritma,flowchart,logika,modul-1",
      uploadedBy: adminUser.id,
    },
  });

  const matEnterprise1 = await prisma.material.create({
    data: {
      title: "Modul ERP 01 - Pengenalan Enterprise Architecture & SAP S/4HANA",
      description: "Panduan pengantar struktur modul ERP, siklus rantai pasok (P2P dan O2C), serta integrasi master data.",
      subjectId: subEnterprise.id,
      type: MaterialType.PPT,
      fileName: "BBK1EAB3_Slide_ERP_Overview.pptx",
      fileUrl: "https://raw.githubusercontent.com/dytoandyto/WebKelas-2605/main/public/materials/BBK1EAB3_ERP_Intro.pptx",
      fileSize: "5.4 MB",
      tags: "erp,enterprise,scm,sap",
      uploadedBy: lecturerUser.id,
    },
  });

  const matDiskrit1 = await prisma.material.create({
    data: {
      title: "Diktat Matematika Diskrit - Logika Proposisi & Himpunan",
      description: "Ringkasan teorema logika, tabel kebenaran, hukum De Morgan, dan operasi himpunan ganda.",
      subjectId: subDiskrit.id,
      type: MaterialType.PDF,
      fileName: "BBK1BAB3_Diktat_Logika_Proposisi.pdf",
      fileUrl: "https://raw.githubusercontent.com/dytoandyto/WebKelas-2605/main/public/materials/BBK1BAB3_Diktat_Diskrit.pdf",
      fileSize: "1.9 MB",
      tags: "diskrit,logika,matematika",
      uploadedBy: lecturerUser.id,
    },
  });

  // 9. Create Daily Notes (Academic Journal format)
  console.log("Creating daily notes / study journal...");
  const note1 = await prisma.dailyNote.create({
    data: {
      date: new Date("2026-09-28T09:00:00Z"),
      title: "Rangkuman Kuliah: Arsitektur Enterprise Systems & Value Chain",
      summary: "Membahas konsep dasar enterprise system, perbedaan silo system vs integrated ERP, dan bagaimana value chain Porter diterapkan dalam pemetaan proses bisnis.",
      content: `Hari ini perkuliahan Sistem Enterprise membahas secara mendalam bagaimana perusahaan bertransformasi dari sistem silo menuju ekosistem ERP terintegrasi.

Poin penting yang didiskusikan:
1. Mengapa sistem informasi silo menyebabkan redundansi data dan inefisiensi inventaris.
2. Peran single source of truth (SSOT) dalam arsitektur database enterprise terpusat.
3. Contoh siklus Order to Cash (O2C) dan Procure to Pay (P2P).

Dosen menekankan pentingnya memahami proses bisnis riil sebelum memilih platform ERP komersial.`,
      importantPoints: "- Integrasi data real-time antar departemen\n- Pengurangan cycle time pengadaan barang\n- Peningkatan akurasi laporan keuangan",
      nextSteps: "Mempersiapkan kelompok studi kasus dan membaca modul ERP bab 2.",
      subjectId: subEnterprise.id,
      authorId: adminUser.id,
      tags: "erp,enterprise,proses-bisnis",
    },
  });

  // Link daily note to material
  await prisma.dailyNoteMaterial.create({
    data: {
      dailyNoteId: note1.id,
      materialId: matEnterprise1.id,
    },
  });

  // 10. Create Students with Proper Fallbacks
  console.log("Creating class students...");
  const student1 = await prisma.student.create({
    data: {
      name: "Dyto Andyto",
      studentNumber: "1204220001",
      major: "S1 Sistem Informasi",
      bio: "Mahasiswa S1 Sistem Informasi Telkom University Jakarta yang antusias terhadap rekayasa sistem enterprise dan arsitektur cloud modern.",
      dream: "Enterprise Systems Architect & Tech Founder",
      motivation: "Belajar terus tanpa henti, bangun karya yang berdampak nyata.",
      githubUrl: "https://github.com/dytoandyto",
      linkedinUrl: "https://linkedin.com/in/dytoandyto",
      portfolioUrl: "https://github.com/dytoandyto",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    },
  });

  const student2 = await prisma.student.create({
    data: {
      name: "Sarah Olivia",
      studentNumber: "1204220002",
      major: "S1 Sistem Informasi",
      bio: "Fokus pada interaksi manusia dan komputer (HCI), analisis sistem informasi bisnis, dan perancangan UI/UX.",
      dream: "Principal Product Designer di tech company terkemuka.",
      motivation: "Desain yang baik adalah yang menyelesaikan masalah pengguna dengan anggun.",
      githubUrl: "https://github.com",
      linkedinUrl: "https://linkedin.com",
      // Test fallback: no photoUrl, testing generated initials avatar
      photoUrl: null,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      name: "David Kurniawan",
      studentNumber: "1204220003",
      major: "S1 Sistem Informasi",
      bio: "Tertarik pada tata kelola data (Data Governance), Business Intelligence, dan optimasi SQL database.",
      dream: "Data Architect di institusi finansial nasional.",
      motivation: "Data adalah aset paling berharga jika diolah menjadi wawasan strategis.",
      githubUrl: "https://github.com",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    },
  });

  const student4 = await prisma.student.create({
    data: {
      name: "Amanda Putri",
      studentNumber: "1204220004",
      major: "S1 Sistem Informasi",
      bio: "Penggiat inovasi teknologi kampus dan analitika sistem informasi manajemen.",
      dream: "Konsultan IT & Analis Sistem Terkemuka.",
      motivation: "Inovasi lahir dari keberanian mencoba hal baru setiap hari.",
      // Test fallback: no achievements, no social media
      photoUrl: null,
    },
  });

  // 11. Create Class Achievements
  console.log("Creating class achievements...");
  const ach1 = await prisma.achievement.create({
    data: {
      title: "Juara 1 Lomba Inovasi Sistem Informasi Nasional 2026",
      description: "Mengembangkan purwarupa aplikasi pemantauan inventaris digital berbasis event-driven untuk UMKM.",
      category: AchievementCategory.COMPETITION,
      achievementDate: new Date("2026-05-15T00:00:00Z"),
      organization: "Forum Komunikasi Mahasiswa Sistem Informasi Indonesia",
      location: "Jakarta",
      badgeIconUrl: "🏆",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
      createdBy: adminUser.id,
      students: {
        create: [
          { studentId: student1.id },
          { studentId: student3.id },
        ],
      },
    },
  });

  // 12. Create Announcements
  console.log("Creating announcements...");
  await prisma.announcement.createMany({
    data: [
      {
        title: "Sosialisasi Jadwal & Peraturan Kuliah Semester Ganjil 2026/2027",
        content: `Selamat datang di perkuliahan Semester Ganjil 2026/2027 untuk kelas JS1SI-26-REG-05 S1 Sistem Informasi Telkom University Jakarta.\n\nHarap seluruh mahasiswa memastikan telah terdaftar di LMS Telkom University pada setiap mata kuliah yang diambil dan mematuhi jadwal perkuliahan tatap muka di ruang masing-masing.`,
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
        isPublished: true,
        publishedAt: new Date("2026-09-20T08:00:00Z"),
        createdBy: adminUser.id,
      },
      {
        title: "Informasi Praktikum Laboratorium Pemrograman RLC.KJ.05.001",
        content: `Sesi praktikum Algoritma dan Pemrograman dimulai tepat waktu setiap Senin pukul 07:30 WIB di Lab RLC.KJ.05.001. Harap membawa laptop masing-masing dengan compiler yang telah terpasang.`,
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
        isPublished: true,
        publishedAt: new Date("2026-09-22T10:00:00Z"),
        createdBy: classAdminUser.id,
      },
    ],
  });

  // 13. Create Activity Log
  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "INITIAL_DATABASE_SEED",
      entityType: "SYSTEM",
      details: "Initial database seed completed for Telkom University Jakarta JS1SI-26-REG-05.",
    },
  });

  console.log("✅ Telkom University Jakarta Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
