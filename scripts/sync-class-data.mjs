import { PrismaClient, DayOfWeek, TaskType, MaterialType, TaskPriority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Syncing Telkom University Jakarta Class Identity & Academic Data...");

  // 1. Settings
  const settingsData = {
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
    githubUrl: "https://github.com/dytoandyto/WebKelas-2605",
    linkedinUrl: "https://linkedin.com",
    instagramUrl: "https://instagram.com",
    discordUrl: "https://discord.gg",
    classMotto: "LEARN. BUILD. GROW. TOGETHER.",
  };

  for (const [key, value] of Object.entries(settingsData)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log("✅ Class settings synced.");

  // 2. Subjects
  const subjectsData = [
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
      code: "UAKKACB2",
      name: "Agama Islam",
      englishName: "Islamic Religion",
      description: "Pondasi akidah, syariat, akhlak mulia, serta integrasi nilai-nilai keislaman dalam pengembangan teknologi dan sains kemasyarakatan.",
      sks: 2,
      lecturerName: "Ust. Ahmad Fauzi, M.Ag.",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-teal-500 to-emerald-600",
    },
  ];

  const subjectMap = {};
  for (const s of subjectsData) {
    const record = await prisma.subject.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
    subjectMap[s.code] = record.id;
  }
  console.log("✅ 7 Subjects synced.");

  // 3. Schedules (delete existing schedules and insert exact 7 schedules)
  await prisma.schedule.deleteMany();
  const schedulesData = [
    {
      subjectId: subjectMap["BBK1AAB4"],
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "07:30",
      endTime: "11:30",
      room: "RLC.KJ.05.001",
      lecturerName: "Muhammad Ardiansyah, S.Kom., M.Kom.",
      className: "JS1SI-26-REG-05",
      notes: "Bawa laptop untuk praktikum logika algoritma dan implementasi compiler.",
    },
    {
      subjectId: subjectMap["BBK1EAB3"],
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "09:30",
      endTime: "12:30",
      room: "RLC.KJ.05.002",
      lecturerName: "Budi Santoso, S.Kom., M.T.",
      className: "JS1SI-26-REG-05",
      notes: "Kuliah arsitektur ERP dan integrasi supply chain.",
    },
    {
      subjectId: subjectMap["BBK1BAB3"],
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "07:30",
      endTime: "10:30",
      room: "RKC.KJ.03.002",
      lecturerName: "Drs. Hendra Wijaya, M.Si.",
      className: "JS1SI-26-REG-05",
      notes: "Pembahasan latihan soal logika proposisi & tabel kebenaran.",
    },
    {
      subjectId: subjectMap["BBK1CAB3"],
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "10:30",
      endTime: "13:30",
      room: "RKC.KJ.04.001",
      lecturerName: "Dr. Rina Astuti, M.Sc.",
      className: "JS1SI-26-REG-05",
      notes: "Aljabar matriks dan kalkulus sistem informasi.",
    },
    {
      subjectId: subjectMap["UCK1FDB1"],
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "14:30",
      endTime: "15:30",
      room: "RLC.KJ.03.003",
      lecturerName: "Tim Dosen Karakter Tel-U",
      className: "JS1SI-26-REG-05",
      notes: "Sesi pembentukan karakter HEI dan etika akademik Tel-U.",
    },
    {
      subjectId: subjectMap["BBK1DAB3"],
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "08:30",
      endTime: "10:30",
      room: "RLC.KJ.03.003",
      lecturerName: "Fitri Ramadhani, S.T., M.M.",
      className: "JS1SI-26-REG-05",
      notes: "Presentasi studi kasus e-commerce dan peran SI strategis.",
    },
    {
      subjectId: subjectMap["UAKKACB2"],
      dayOfWeek: DayOfWeek.SATURDAY,
      startTime: "07:30",
      endTime: "09:30",
      room: "RKC.KJ.03.001",
      lecturerName: "Ust. Ahmad Fauzi, M.Ag.",
      className: "JS1SI-26-REG-05",
      notes: "Kajian nilai moralitas dan etika profesi teknologi.",
    },
  ];

  for (const sch of schedulesData) {
    await prisma.schedule.create({ data: sch });
  }
  console.log("✅ 7 Schedules synced.");

  // Get admin user for authoring
  const adminUser = await prisma.user.findFirst();
  if (!adminUser) {
    console.log("No user found.");
    return;
  }

  // 4. Tasks (Seed if less than 3)
  const taskCount = await prisma.task.count();
  if (taskCount < 4) {
    const now = new Date();
    await prisma.task.createMany({
      data: [
        {
          subjectId: subjectMap["BBK1AAB4"],
          title: "Tugas Praktikum Modul 1: Notasi Algoritmik & Flowchart",
          description: "Susun algoritma pencarian linear beserta flowchart dan pseudocode untuk permasalahan antrean data mahasiswa.",
          deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          taskType: TaskType.INDIVIDUAL,
          estimatedTime: "3 jam",
          priority: TaskPriority.HIGH,
          status: TaskStatus.DUE_SOON,
          notes: "Kumpulkan dalam format PDF sesuai template laporan resmi Tel-U.",
          createdBy: adminUser.id,
        },
        {
          subjectId: subjectMap["BBK1EAB3"],
          title: "Studi Kasus Analisis Integrasi ERP Perusahaan Ritel",
          description: "Analisis implementasi Enterprise Resource Planning pada salah satu perusahaan ritel nasional (studi alur supply chain dan keuangan).",
          deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          taskType: TaskType.GROUP,
          estimatedTime: "1 minggu",
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.UPCOMING,
          groupName: "Kelompok 03",
          groupMembers: "Alex Raditya Pratama, Sarah Olivia Jenkins, David Kurniawan, Nadia Zahra",
          notes: "Sertakan diagram arsitektur sistem dan pembagian kerja tim.",
          createdBy: adminUser.id,
        },
        {
          subjectId: subjectMap["BBK1BAB3"],
          title: "Problem Set Logika Proposisi & Pembuktian Teorema",
          description: "Selesaikan 10 latihan soal konjungsi, disjungsi, implikasi, dan tabel kebenaran dari Diktat Bab 1.",
          deadline: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
          taskType: TaskType.INDIVIDUAL,
          estimatedTime: "4 jam",
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.UPCOMING,
          notes: "Tulis tangan rapi di kertas folio bergaris lalu scan.",
          createdBy: adminUser.id,
        },
        {
          subjectId: subjectMap["BBK1DAB3"],
          title: "Resume Bab 2: Information Systems & Business Strategy",
          description: "Tugas tambahan: Baca dan buat rangkuman kritis mengenai model kompetitif Michael Porter dalam konteks sistem informasi modern.",
          deadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
          taskType: TaskType.ADDITIONAL,
          estimatedTime: "2 jam",
          priority: TaskPriority.LOW,
          status: TaskStatus.UPCOMING,
          notes: "Tugas pengayaan nilai UTS.",
          createdBy: adminUser.id,
        },
      ],
    });
    console.log("✅ Tasks created.");
  }

  // 5. Materials (Seed if none)
  const materialCount = await prisma.material.count();
  if (materialCount === 0) {
    await prisma.material.createMany({
      data: [
        {
          title: "Modul 01 - Pengantar Logika Algoritma & Notasi Pseudocode",
          description: "Materi pengenalan dasar logika algoritma, simbol standar flowchart internasional, serta kaidah penulisan pseudocode.",
          subjectId: subjectMap["BBK1AAB4"],
          type: MaterialType.PDF,
          fileName: "Modul01_Algoritma_Pemrograman.pdf",
          fileSize: "2.4 MB",
          tags: "algoritma, pseudocode, flowchart",
          uploadedBy: adminUser.id,
        },
        {
          title: "Slide Perkuliahan: Enterprise Systems & Arsitektur ERP Modern",
          description: "Slide komprehensif mengenai konsep Enterprise Resource Planning, modul bisnis terintegrasi, dan studi kasus rantai pasok.",
          subjectId: subjectMap["BBK1EAB3"],
          type: MaterialType.PPT,
          fileName: "Week01_Enterprise_Systems_Overview.pptx",
          fileSize: "4.8 MB",
          tags: "erp, enterprise, supply chain",
          uploadedBy: adminUser.id,
        },
        {
          title: "Diktat Matematika Diskrit: Logika Proposisi & Himpunan",
          description: "Buku ajar dan diktat resmi matematika diskrit mencakup tabel kebenaran, hukum aljabar boolean, dan teori himpunan.",
          subjectId: subjectMap["BBK1BAB3"],
          type: MaterialType.PDF,
          fileName: "Diktat_Matematika_Diskrit_Bab1.pdf",
          fileSize: "1.9 MB",
          tags: "matematika diskrit, logika, himpunan",
          uploadedBy: adminUser.id,
        },
        {
          title: "Portal Akademik & Perpustakaan Digital Tel-U (iGracias)",
          description: "Tautan resmi sistem informasi akademik universitas dan repositori jurnal ilmiah Telkom University.",
          subjectId: subjectMap["BBK1DAB3"],
          type: MaterialType.LINK,
          externalUrl: "https://igracias.telkomuniversity.ac.id",
          tags: "igracias, portal, akademik",
          uploadedBy: adminUser.id,
        },
      ],
    });
    console.log("✅ Materials created.");
  }

  // 6. Daily Notes (Seed if none)
  const dailyNoteCount = await prisma.dailyNote.count();
  if (dailyNoteCount === 0) {
    await prisma.dailyNote.create({
      data: {
        date: new Date("2026-09-21T07:30:00Z"),
        title: "Belajar Dasar Algoritma & Flowchart Standar",
        summary: "Hari ini membahas konsep dasar logika algoritma, perbedaan flowchart vs pseudocode, dan struktur kontrol sekuensial.",
        content: "Pada perkuliahan perdana Algoritma dan Pemrograman bersama Dosen Wali Muhammad Ardiansyah, kelas mempelajari esensi dasar berpikir komputasional (*computational thinking*). Kami menguraikan masalah nyata ke dalam tahapan sekuensial yang logis sebelum diubah ke sintaks kode bahasa pemrograman.\n\nFokus utama sesi ini adalah memastikan seluruh mahasiswa memahami perbedaan representasi visual menggunakan simbol-simbol ISO (terminator, proses, input/output, decision) dan representasi tekstual pseudocode.",
        importantPoints: "• Pengertian algoritma efisien dan deterministik\n• Simbol-simbol dasar flowchart standar internasional\n• Notasi pseudocode terstruktur\n• Aturan penamaan variabel dan tipe data primitif\n• Alur instruksi sekuensial vs percabangan (if-else)",
        nextSteps: "• Mengunduh compiler dan mengonfigurasi VS Code di laptop masing-masing\n• Mengerjakan 5 soal latihan pembuatan flowchart di Modul 01\n• Mengumpulkan laporan praktikum sebelum deadline pekan depan",
        subjectId: subjectMap["BBK1AAB4"],
        authorId: adminUser.id,
        tags: "algoritma, pseudocode, flowchart",
      },
    });

    await prisma.dailyNote.create({
      data: {
        date: new Date("2026-09-22T09:30:00Z"),
        title: "Pondasi Sistem Enterprise & Integrasi Proses Bisnis",
        summary: "Mempelajari peranan krusial sistem ERP modern dalam mengeliminasi silo informasi dan menyatukan proses lintas departemen.",
        content: "Dalam sesi kuliah Sistem Enterprise hari ini, Budi Santoso memaparkan evolusi sistem informasi dari masa aplikasi monolitik terfragmentasi menuju era ERP modern berbasis cloud. Kelas mendiskusikan studi kasus nyata bagaimana keterlambatan sinkronisasi data inventory di gudang dapat melumpuhkan sistem akuntansi dan customer support perusahaan jika tidak terintegrasi.",
        importantPoints: "• Pengertian dan arsitektur enterprise resource planning (ERP)\n• Mengatasi problem data silo antar departemen perusahaan\n• Modul inti ERP: SCM, CRM, HRM, dan Financial Accounting\n• Analisis rantai nilai bisnis (Porter Value Chain)",
        nextSteps: "• Pembentukan kelompok studi kasus analisis sistem ERP\n• Mempelajari slide presentasi Week 01\n• Menentukan perusahaan target untuk observasi proses bisnis",
        subjectId: subjectMap["BBK1EAB3"],
        authorId: adminUser.id,
        tags: "enterprise, erp, supply chain",
      },
    });
    console.log("✅ Daily notes created.");
  }

  // Update existing students major to "S1 Sistem Informasi"
  await prisma.student.updateMany({
    data: { major: "S1 Sistem Informasi" },
  });
  console.log("✅ Student records aligned with S1 Sistem Informasi.");
  console.log("🎉 Sync completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
