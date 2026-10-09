import {
  PrismaClient,
  UserRole,
  DayOfWeek,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Clean Admin Setup for ClassHub (JS1SI-26-REG-05)...");

  // 1. Clean existing records in dependency order
  await prisma.activityLog.deleteMany();
  await prisma.studentAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.dailyNoteMaterial.deleteMany();
  await prisma.dailyNoteTask.deleteMany();
  await prisma.dailyNote.deleteMany();
  await prisma.material.deleteMany();
  await prisma.task.deleteMany();
  await prisma.classEvent.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // 2. Hash default password for System Administrator
  const adminPassword = await bcrypt.hash("AdminClassHub2026!", 12);

  // 3. Create System Administrator (Single authoritative admin account)
  console.log("Creating SuperAdmin account...");
  await prisma.user.create({
    data: {
      name: "SuperAdmin",
      email: "admin@classhub.edu",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // 4. Create Settings (Clean Class Identity Baseline)
  console.log("Configuring baseline class identity settings...");
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

  // 5. Create 7 Curriculum Subjects
  console.log("Creating 7 curriculum subjects...");
  const subAlgoritma = await prisma.subject.create({
    data: {
      code: "BBK1AAB4",
      name: "Algoritma dan Pemrograman",
      englishName: "Algorithms and Programming",
      description: "Dasar logika komputasi, struktur data primitif, algoritma pencarian/pengurutan, flowchart, pseudocode, dan implementasi kode terstruktur.",
      sks: 4,
      lecturerName: "Ahmad Ridwan Fauzi",
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
      lecturerName: "Putri Utami Rukmana",
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
      lecturerName: "Hafidza Safara Zahratunnisa",
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
      lecturerName: "Novyta",
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
      lecturerName: "Puspita Parahita Anindita",
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
      lecturerName: "Muhammad Ardiansyah",
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
      lecturerName: "Ardi Ardiansyah",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-teal-500 to-emerald-600",
    },
  });

  // 6. Create 7 Exact Class Schedules
  console.log("Creating 7 timetable schedules linked to subjects...");
  await prisma.schedule.createMany({
    data: [
      {
        subjectId: subAlgoritma.id,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: "07:30",
        endTime: "11:30",
        room: "RLC.KJ.05.001",
        lecturerName: "Ahmad Ridwan Fauzi",
        className: "JS1SI-26-REG-05",
        notes: "Bawa laptop untuk praktikum algoritma dasar dan compiler",
      },
      {
        subjectId: subEnterprise.id,
        dayOfWeek: DayOfWeek.TUESDAY,
        startTime: "09:30",
        endTime: "12:30",
        room: "RLC.KJ.05.002",
        lecturerName: "Putri Utami Rukmana",
        className: "JS1SI-26-REG-05",
        notes: "Kuliah teori arsitektur ERP dan studi kasus proses bisnis",
      },
      {
        subjectId: subDiskrit.id,
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: "07:30",
        endTime: "10:30",
        room: "RKC.KJ.03.002",
        lecturerName: "Hafidza Safara Zahratunnisa",
        className: "JS1SI-26-REG-05",
        notes: "Pembahasan latihan soal logika proposisi & tabel kebenaran",
      },
      {
        subjectId: subMatematikaSI.id,
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: "10:30",
        endTime: "13:30",
        room: "RKC.KJ.04.001",
        lecturerName: "Novyta",
        className: "JS1SI-26-REG-05",
        notes: "Aljabar matriks dan kalkulus sistem informasi",
      },
      {
        subjectId: subKarakter.id,
        dayOfWeek: DayOfWeek.THURSDAY,
        startTime: "14:30",
        endTime: "15:30",
        room: "RLC.KJ.03.003",
        lecturerName: "Muhammad Ardiansyah",
        className: "JS1SI-26-REG-05",
        notes: "Sesi pembentukan karakter HEI dan etika kampus",
      },
      {
        subjectId: subPengantarSI.id,
        dayOfWeek: DayOfWeek.FRIDAY,
        startTime: "08:30",
        endTime: "10:30",
        room: "RLC.KJ.03.003",
        lecturerName: "Puspita Parahita Anindita",
        className: "JS1SI-26-REG-05",
        notes: "Presentasi studi kasus sistem informasi e-commerce",
      },
      {
        subjectId: subAgama.id,
        dayOfWeek: DayOfWeek.SATURDAY,
        startTime: "07:30",
        endTime: "09:30",
        room: "RKC.KJ.03.001",
        lecturerName: "Ardi Ardiansyah",
        className: "JS1SI-26-REG-05",
        notes: "Kajian nilai etika dan moralitas dalam profesi digital",
      },
    ],
  });

  console.log("✅ Clean Admin Setup Seeder finished successfully!");
  console.log("📊 Result: 1 Admin User, 7 Subjects, 7 Schedules, 0 Dummy Records.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
