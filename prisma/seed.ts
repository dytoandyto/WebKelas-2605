import {
  PrismaClient,
  UserRole,
  DayOfWeek,
  TaskPriority,
  TaskStatus,
  AchievementCategory,
  ResourceCategory,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ClassHub database seed...");

  // 1. Clean existing records in correct order (handling foreign key cascades)
  await prisma.activityLog.deleteMany();
  await prisma.studentAchievement.deleteMany();
  await prisma.achievement.deleteMany();
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

  // 3. Create Users
  console.log("Creating administrative users...");
  const adminUser = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@classhub.edu",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const classAdminUser = await prisma.user.create({
    data: {
      name: "Class Coordinator",
      email: "classadmin@classhub.edu",
      passwordHash: classAdminPassword,
      role: UserRole.CLASS_ADMIN,
      isActive: true,
    },
  });

  const lecturerUser = await prisma.user.create({
    data: {
      name: "Dr. Aris Thorne",
      email: "lecturer@classhub.edu",
      passwordHash: lecturerPassword,
      role: UserRole.LECTURER,
      isActive: true,
    },
  });

  const assistantUser = await prisma.user.create({
    data: {
      name: "Bryan Tech Assistant",
      email: "assistant@classhub.edu",
      passwordHash: assistantPassword,
      role: UserRole.ASSISTANT,
      isActive: true,
    },
  });

  // 4. Create Subjects
  console.log("Creating academic subjects...");
  const cs101 = await prisma.subject.create({
    data: {
      code: "CS101",
      name: "Introduction to Computer Science",
      description: "Foundational computer science principles, discrete mathematics, and problem-solving methodologies.",
      lecturerName: "Dr. Aris Thorne",
    },
  });

  const cs201 = await prisma.subject.create({
    data: {
      code: "CS201",
      name: "Data Structures & Algorithms",
      description: "Advanced data structures, computational complexity, dynamic programming, and graph algorithms.",
      lecturerName: "Prof. Helena Vance",
    },
  });

  const cs301 = await prisma.subject.create({
    data: {
      code: "CS301",
      name: "Database Systems & Cloud Architecture",
      description: "Relational database modeling, query optimization, ACID transactions, and distributed cloud databases.",
      lecturerName: "Dr. David Chen",
    },
  });

  const cs310 = await prisma.subject.create({
    data: {
      code: "CS310",
      name: "Web Application Engineering",
      description: "Fullstack web development with modern frameworks, server-side rendering, and scalable architectures.",
      lecturerName: "Ir. Maya Kusuma, M.Kom",
    },
  });

  const cs405 = await prisma.subject.create({
    data: {
      code: "CS405",
      name: "Artificial Intelligence & Machine Learning",
      description: "Neural network architectures, statistical learning theory, computer vision, and generative models.",
      lecturerName: "Prof. Marcus Aurel",
    },
  });

  // 5. Create Schedules
  console.log("Creating class schedules...");
  await prisma.schedule.createMany({
    data: [
      {
        subjectId: cs101.id,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: "08:30",
        endTime: "11:00",
        room: "Auditorium Hall A-301",
        lecturerName: "Dr. Aris Thorne",
        notes: "Bring laptop with Python 3.12+ installed",
      },
      {
        subjectId: cs201.id,
        dayOfWeek: DayOfWeek.TUESDAY,
        startTime: "10:00",
        endTime: "12:30",
        room: "Advanced Computing Lab 402",
        lecturerName: "Prof. Helena Vance",
        notes: "Weekly algorithm problem sets discussion",
      },
      {
        subjectId: cs301.id,
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: "13:00",
        endTime: "15:30",
        room: "Hall B-102",
        lecturerName: "Dr. David Chen",
        notes: "PostgreSQL and query benchmarking exercises",
      },
      {
        subjectId: cs310.id,
        dayOfWeek: DayOfWeek.THURSDAY,
        startTime: "09:00",
        endTime: "11:30",
        room: "Software Engineering Lab 3",
        lecturerName: "Ir. Maya Kusuma, M.Kom",
        notes: "Next.js project consultations and live code review",
      },
      {
        subjectId: cs405.id,
        dayOfWeek: DayOfWeek.FRIDAY,
        startTime: "13:30",
        endTime: "16:00",
        room: "Multimedia Center Room 204",
        lecturerName: "Prof. Marcus Aurel",
        notes: "PyTorch workshop session",
      },
    ],
  });

  // 6. Create Tasks with realistic upcoming & due dates
  console.log("Creating academic tasks...");
  const now = new Date();
  const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const inNineDays = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        subjectId: cs310.id,
        title: "Milestone 2: App Router Authentication & Database Schema",
        description: "Implement secure server actions, Prisma PostgreSQL integration, and role-based access control.",
        deadline: inTwoDays,
        priority: TaskPriority.HIGH,
        status: TaskStatus.DUE_SOON,
        createdBy: classAdminUser.id,
      },
      {
        subjectId: cs301.id,
        title: "PostgreSQL Performance Benchmarking & Query Tuning",
        description: "Analyze EXPLAIN ANALYZE execution plans, composite indexes, and write an optimization report.",
        deadline: inFiveDays,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.UPCOMING,
        createdBy: lecturerUser.id,
      },
      {
        subjectId: cs405.id,
        title: "Deep Neural Network Image Classifier Training",
        description: "Train a ResNet model on CIFAR-100 and achieve >= 82% top-1 accuracy on the validation split.",
        deadline: inNineDays,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.UPCOMING,
        createdBy: lecturerUser.id,
      },
      {
        subjectId: cs201.id,
        title: "Self-Balancing Red-Black Tree Implementation",
        description: "Submit C++ or Java implementation of node insertion, rotation invariants, and deletion.",
        deadline: threeDaysAgo,
        priority: TaskPriority.HIGH,
        status: TaskStatus.OVERDUE,
        createdBy: assistantUser.id,
      },
      {
        subjectId: cs101.id,
        title: "Ethics in Computer Science & Artificial Intelligence Essay",
        description: "Submit a 2,000-word critical evaluation on algorithmic bias and transparent AI governance.",
        deadline: lastWeek,
        priority: TaskPriority.LOW,
        status: TaskStatus.COMPLETED,
        createdBy: lecturerUser.id,
      },
    ],
  });

  // 7. Create Students
  console.log("Creating student profiles...");
  const studentAlex = await prisma.student.create({
    data: {
      name: "Alex Raditya Pratama",
      studentNumber: "220601201",
      major: "Computer Science",
      bio: "Full-stack engineer passionate about cloud architecture, reactive systems, and open-source software.",
      dream: "Founding an open developer platform that empowers emerging engineers globally.",
      motivation: "Code is poetry that executes. Strive to make every line meaningful and impactful.",
      githubUrl: "https://github.com/alexraditya",
      linkedinUrl: "https://linkedin.com/in/alexraditya",
      portfolioUrl: "https://alexraditya.dev",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    },
  });

  const studentSarah = await prisma.student.create({
    data: {
      name: "Sarah Olivia Jenkins",
      studentNumber: "220601202",
      major: "Information Systems",
      bio: "Product strategist and UI/UX researcher dedicated to creating accessible and human-centered digital experiences.",
      dream: "Leading digital transformation initiatives for global education accessibility.",
      motivation: "Design is not just what it looks like and feels like. Design is how it works.",
      githubUrl: "https://github.com/sarahjenkins",
      linkedinUrl: "https://linkedin.com/in/sarahjenkins",
      portfolioUrl: "https://sarahjenkins.design",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
    },
  });

  const studentDavid = await prisma.student.create({
    data: {
      name: "David Kurniawan",
      studentNumber: "220601203",
      major: "Software Engineering",
      bio: "Competitive programmer and distributed systems enthusiast. Loves tackling complex algorithmic puzzles.",
      dream: "Becoming a Principal Infrastructure Architect at a world-class technology firm.",
      motivation: "Continuous learning and relentless problem solving.",
      githubUrl: "https://github.com/davidkurniawan",
      linkedinUrl: "https://linkedin.com/in/davidkurniawan",
      portfolioUrl: "https://davidk.dev",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    },
  });

  const studentNadia = await prisma.student.create({
    data: {
      name: "Nadia Zahra",
      studentNumber: "220601204",
      major: "Artificial Intelligence",
      bio: "AI researcher focusing on computer vision and multi-modal neural network architectures.",
      dream: "Publishing groundbreaking AI medical diagnostics research in top-tier conferences.",
      motivation: "Harnessing technology to solve the world's most difficult healthcare challenges.",
      githubUrl: "https://github.com/nadiazahra",
      linkedinUrl: "https://linkedin.com/in/nadiazahra",
      photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
    },
  });

  const studentKevin = await prisma.student.create({
    data: {
      name: "Kevin Sanjaya",
      studentNumber: "220601205",
      major: "Computer Science",
      bio: "Cybersecurity analyst, CTF player, and reverse engineering enthusiast.",
      dream: "Securing critical cloud infrastructures from modern cyber vulnerabilities.",
      motivation: "Security is a process, not a state. Always stay vigilant and curious.",
      githubUrl: "https://github.com/kevinsanjaya",
      linkedinUrl: "https://linkedin.com/in/kevinsanjaya",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
    },
  });

  const studentAmanda = await prisma.student.create({
    data: {
      name: "Amanda Putri",
      studentNumber: "220601206",
      major: "Data Science",
      bio: "Data storyteller and predictive modeling researcher analyzing urban mobility and sustainable cities.",
      dream: "Building data-driven climate resilience and smart city infrastructure solutions.",
      motivation: "In God we trust; all others must bring clean data.",
      githubUrl: "https://github.com/amandaputri",
      linkedinUrl: "https://linkedin.com/in/amandaputri",
      photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80",
    },
  });

  // 8. Create Achievements
  console.log("Creating achievements...");
  const hackathonAch = await prisma.achievement.create({
    data: {
      title: "1st Place Champion - National Tech Innovation Hackathon 2026",
      description: "Built an AI-driven smart emergency response and disaster routing platform within 36 consecutive hours.",
      category: AchievementCategory.COMPETITION,
      achievementDate: new Date("2026-03-15T00:00:00Z"),
      organization: "National Ministry of Education & Tech Giants Guild",
      location: "Jakarta Convention Center",
      badgeIconUrl: "🏆",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
      createdBy: adminUser.id,
      students: {
        create: [
          { studentId: studentAlex.id },
          { studentId: studentDavid.id },
          { studentId: studentSarah.id },
        ],
      },
    },
  });

  const researchAch = await prisma.achievement.create({
    data: {
      title: "Best Academic Paper Award - IEEE International Conference",
      description: "Published and presented research on lightweight Transformer models for embedded Edge IoT computing.",
      category: AchievementCategory.ACADEMIC,
      achievementDate: new Date("2026-05-20T00:00:00Z"),
      organization: "IEEE Computer Society",
      location: "Singapore / Virtual",
      badgeIconUrl: "📜",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
      createdBy: lecturerUser.id,
      students: {
        create: [
          { studentId: studentNadia.id },
          { studentId: studentAmanda.id },
        ],
      },
    },
  });

  const volunteerAch = await prisma.achievement.create({
    data: {
      title: "Lead Mentors for High School STEM Empowerment Program",
      description: "Organized a 6-week weekend programming and robotics workshop for over 250 underprivileged high school students.",
      category: AchievementCategory.VOLUNTEER,
      achievementDate: new Date("2026-02-10T00:00:00Z"),
      organization: "Yayasan Generasi Maju Indonesia",
      location: "Bandung, West Java",
      badgeIconUrl: "🤝",
      imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80",
      createdBy: classAdminUser.id,
      students: {
        create: [
          { studentId: studentSarah.id },
          { studentId: studentKevin.id },
        ],
      },
    },
  });

  const ctfAch = await prisma.achievement.create({
    data: {
      title: "Top 3 Finalist - University Cyber Defense CTF Championship",
      description: "Competed in high-intensity red-teaming, binary exploitation, and cloud penetration testing.",
      category: AchievementCategory.COMPETITION,
      achievementDate: new Date("2026-04-05T00:00:00Z"),
      organization: "Cyber Security Association",
      location: "Yogyakarta",
      badgeIconUrl: "🛡️",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      createdBy: assistantUser.id,
      students: {
        create: [
          { studentId: studentKevin.id },
          { studentId: studentDavid.id },
        ],
      },
    },
  });

  // 9. Create Announcements
  console.log("Creating announcements...");
  await prisma.announcement.createMany({
    data: [
      {
        title: "Midterm Examination Schedule, Rules & Room Allocation Released",
        content: `The official examination schedule for the Even Semester 2026 has been published.\n\nAll students must review their assigned room numbers and arrive at least 15 minutes before the exam begins. Bring your student ID card and ensure all electronic communication devices are placed in silent mode inside bags.\n\nGood luck with your preparations!`,
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
        isPublished: true,
        publishedAt: new Date("2026-09-20T08:00:00Z"),
        createdBy: adminUser.id,
      },
      {
        title: "Distinguished Guest Lecture: Modern Cloud Architecture with Google Cloud",
        content: `We are thrilled to invite all students to a guest lecture featuring Principal Engineers from Google Cloud on modern distributed systems, event-driven microservices, and serverless architectures.\n\nDate: Thursday, Oct 8, 2026\nTime: 13:00 - 15:30 WIB\nVenue: Main Auditorium & Live Stream\n\nAttendance counts towards CS301 laboratory extra credits!`,
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
        isPublished: true,
        publishedAt: new Date("2026-09-24T10:00:00Z"),
        createdBy: lecturerUser.id,
      },
      {
        title: "Annual Hackathon Team Formation & Ideation Session",
        content: `Looking for teammates for the upcoming Inter-University Hackathon? We will host an informal networking and ideation mixer in Software Lab 3 this coming Friday at 16:30 WIB. Free pizza and beverages provided!`,
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
        isPublished: true,
        publishedAt: new Date("2026-09-25T14:00:00Z"),
        createdBy: classAdminUser.id,
      },
      {
        title: "INTERNAL DRAFT: Upcoming Laboratory Maintenance & Server Migration",
        content: "Draft notice: Software Lab 3 servers will undergo routine kernel upgrades and storage migration over the coming weekend. Please do not publish publicly yet.",
        isPublished: false,
        createdBy: assistantUser.id,
      },
    ],
  });

  // 10. Create Gallery
  console.log("Creating gallery memories...");
  await prisma.gallery.createMany({
    data: [
      {
        title: "Class Orientation & Welcome Gathering 2026",
        description: "Welcoming our fellow students, introducing the core mentors, and discussing academic targets for the year.",
        imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80",
        eventDate: new Date("2026-01-15T00:00:00Z"),
        uploadedBy: classAdminUser.id,
      },
      {
        title: "Cloud Architecture Sprint & Live Coding Workshop",
        description: "Hands-on session deploying distributed services, microservices benchmarks, and CI/CD pipelines.",
        imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
        eventDate: new Date("2026-02-28T00:00:00Z"),
        uploadedBy: assistantUser.id,
      },
      {
        title: "National Hackathon 36-Hour Final Presentation",
        description: "Our class representative team delivering the live product pitch to industry judges at JCC.",
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
        eventDate: new Date("2026-03-16T00:00:00Z"),
        uploadedBy: adminUser.id,
      },
      {
        title: "Campus Tech Expo & Interactive Software Showcase",
        description: "Demonstrating class capstone projects, student robotics, and AI systems to visitors and prospective partners.",
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
        eventDate: new Date("2026-04-20T00:00:00Z"),
        uploadedBy: classAdminUser.id,
      },
      {
        title: "Mid-Semester Study Group & Coding Jam",
        description: "Collaborative study group preparing algorithms and data structures mock exams over coffee.",
        imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80",
        eventDate: new Date("2026-05-12T00:00:00Z"),
        uploadedBy: assistantUser.id,
      },
      {
        title: "Industry Mentorship & Tech Career Talk",
        description: "Interactive Q&A session with alumni working at top tech firms on internships and resume building.",
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
        eventDate: new Date("2026-06-04T00:00:00Z"),
        uploadedBy: lecturerUser.id,
      },
    ],
  });

  // 11. Create Resources
  console.log("Creating academic resources...");
  await prisma.resource.createMany({
    data: [
      {
        title: "Class GitHub Classroom Organization",
        description: "Official repository hub for weekly laboratory exercises, starter kits, and project templates.",
        url: "https://github.com/classhub-official",
        category: ResourceCategory.CLASS,
        createdBy: classAdminUser.id,
      },
      {
        title: "Next.js App Router & React Server Components Guide",
        description: "Comprehensive documentation on Server Components, Server Actions, caching, and streaming.",
        url: "https://nextjs.org/docs/app",
        category: ResourceCategory.REFERENCE,
        createdBy: lecturerUser.id,
      },
      {
        title: "PostgreSQL & Prisma ORM Official Documentation",
        description: "Relational database concepts, schema modeling, migration workflows, and relation queries.",
        url: "https://www.prisma.io/docs",
        category: ResourceCategory.ACADEMIC,
        createdBy: lecturerUser.id,
      },
      {
        title: "University Academic Information & Grade Portal (SIAK)",
        description: "Official campus student portal for course enrollment, tuition fee payments, and transcript verification.",
        url: "https://campus.university.ac.id/portal",
        category: ResourceCategory.IMPORTANT_LINK,
        createdBy: adminUser.id,
      },
      {
        title: "Web Standards & Accessibility Guidelines (WCAG 2.2)",
        description: "Essential reference for building inclusive, keyboard-navigable, and accessible web experiences.",
        url: "https://www.w3.org/WAI/standards-guidelines/wcag/",
        category: ResourceCategory.REFERENCE,
        createdBy: classAdminUser.id,
      },
      {
        title: "MIT OpenCourseWare: Algorithms & System Design",
        description: "Free video lectures, lecture notes, and assignments from MIT EECS courses.",
        url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/",
        category: ResourceCategory.ACADEMIC,
        createdBy: lecturerUser.id,
      },
    ],
  });

  // 12. Create Settings
  console.log("Creating class settings...");
  const settingsData = [
    { key: "className", value: "Informatics Engineering 2026 — Class A" },
    { key: "classDescription", value: "Official digital class hub and academic platform for Informatics Engineering Class A, Department of Computer Science." },
    { key: "academicYear", value: "2026/2027" },
    { key: "contactEmail", value: "contact@classhub.edu" },
    { key: "githubUrl", value: "https://github.com/classhub-official" },
    { key: "instagramUrl", value: "https://instagram.com/classhub.2026" },
    { key: "discordUrl", value: "https://discord.gg/classhub" },
    { key: "classMotto", value: "Innovate, Collaborate, Elevate." },
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 13. Create initial Activity Log
  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: "INITIAL_DATABASE_SEED",
      entityType: "SYSTEM",
      details: "Database successfully initialized with production seed data and demo credentials.",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("\n📋 DEMO CREDENTIALS FOR TESTING:");
  console.log("----------------------------------------------------------------");
  console.log("👑 ADMIN:       admin@classhub.edu      / AdminClassHub2026!");
  console.log("🛡️ CLASS_ADMIN: classadmin@classhub.edu / ClassAdmin2026!");
  console.log("🎓 LECTURER:    lecturer@classhub.edu   / Lecturer2026!");
  console.log("⚡ ASSISTANT:   assistant@classhub.edu  / Assistant2026!");
  console.log("----------------------------------------------------------------\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
