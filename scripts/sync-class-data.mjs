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
      lecturerName: "Ahmad Ridwan Fauzi",
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
      lecturerName: "Hafidza Safara Zahratunnisa",
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
      lecturerName: "Novyta",
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
      lecturerName: "Puspita Parahita Anindita",
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
      lecturerName: "Putri Utami Rukmana",
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
      lecturerName: "Muhammad Ardiansyah",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "from-rose-500 to-pink-600",
    },
    {
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
      lecturerName: "Ahmad Ridwan Fauzi",
      className: "JS1SI-26-REG-05",
      notes: "Bawa laptop untuk praktikum logika algoritma dan implementasi compiler.",
    },
    {
      subjectId: subjectMap["BBK1EAB3"],
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "09:30",
      endTime: "12:30",
      room: "RLC.KJ.05.002",
      lecturerName: "Putri Utami Rukmana",
      className: "JS1SI-26-REG-05",
      notes: "Kuliah arsitektur ERP dan integrasi supply chain.",
    },
    {
      subjectId: subjectMap["BBK1BAB3"],
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "07:30",
      endTime: "10:30",
      room: "RKC.KJ.03.002",
      lecturerName: "Hafidza Safara Zahratunnisa",
      className: "JS1SI-26-REG-05",
      notes: "Pembahasan latihan soal logika proposisi & tabel kebenaran.",
    },
    {
      subjectId: subjectMap["BBK1CAB3"],
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "10:30",
      endTime: "13:30",
      room: "RKC.KJ.04.001",
      lecturerName: "Novyta",
      className: "JS1SI-26-REG-05",
      notes: "Aljabar matriks dan kalkulus sistem informasi.",
    },
    {
      subjectId: subjectMap["UCK1FDB1"],
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "14:30",
      endTime: "15:30",
      room: "RLC.KJ.03.003",
      lecturerName: "Muhammad Ardiansyah",
      className: "JS1SI-26-REG-05",
      notes: "Sesi pembentukan karakter HEI dan etika akademik Tel-U.",
    },
    {
      subjectId: subjectMap["BBK1DAB3"],
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "08:30",
      endTime: "10:30",
      room: "RLC.KJ.03.003",
      lecturerName: "Puspita Parahita Anindita",
      className: "JS1SI-26-REG-05",
      notes: "Presentasi studi kasus e-commerce dan peran SI strategis.",
    },
    {
      subjectId: subjectMap["UAKXACB2"],
      dayOfWeek: DayOfWeek.SATURDAY,
      startTime: "07:30",
      endTime: "09:30",
      room: "RKC.KJ.03.001",
      lecturerName: "Ardi Ardiansyah",
      className: "JS1SI-26-REG-05",
      notes: "Kajian nilai moralitas dan etika profesi teknologi.",
    },
  ];

  for (const sch of schedulesData) {
    await prisma.schedule.create({ data: sch });
  }
  console.log("🎉 Academic baseline sync completed (Settings, 7 Subjects, 7 Schedules).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
