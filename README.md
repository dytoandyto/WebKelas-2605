# ClassHub — Modern Class & Cohort Management Web Application

<p align="center">
  <strong>A full-stack, production-ready web portal designed for university classes, student cohorts, and academic communities.</strong>
</p>

---

## 🌟 Key Features

### 🎓 Public Portal
- **Interactive Home Dashboard**: Live overview featuring today's schedule, pending task deadlines, highlighted achievements, latest announcements, featured classmates, and class gallery moments.
- **Weekly Schedule Timetable**: Day-grouped class slots with start/end times, room locations, lecturer names, and direct links to syllabus details.
- **Coursework & Task Deadlines**: Dynamic countdowns and status indicators (*Upcoming*, *Due Soon*, *Overdue*, *Completed*) with filterable priority levels.
- **Student Cohort Directory**: Student profile cards featuring bios, student numbers (NIM), career aspirations, portfolios, social links (GitHub, LinkedIn), and achievements.
- **Detailed Student Profiles (`/students/[id]`)**: Deep-dive into each student's bio, motivation, career dream, and individual or team achievements.
- **Hall of Fame & Achievements (`/achievements`)**: Categorized honors (Competitions, Academic, Volunteering, Technology, Leadership) with participant tags and awards.
- **Class Bulletins & Announcements (`/announcements`)**: Formatted announcements with publish controls and category badges.
- **Campus & Activity Gallery (`/gallery`)**: Visual memories and photo albums from workshops, study groups, hackathons, and gatherings.
- **Shared Class Resources (`/resources`)**: Curated links to official cloud drives, GitHub Classroom organizations, textbooks, and development tools.

### 🛡️ Administrative Portal (`/admin`)
- **Executive Dashboard**: Key metrics (enrolled students, courses, pending tasks, awards, active announcements) with recent audit activity feeds.
- **Schedule Management**: Full CRUD for weekly class timetables, rooms, and lecturer assignments.
- **Tasks & Assignments Management**: Create, update, toggle completion status, and set deadlines with automated due-date computation.
- **Subjects Curriculum Management**: Manage course codes, subject syllabi, and faculty lecturers.
- **Student Roster Management**: Add student records, edit biographies, career dreams, and social links.
- **Achievements Management**: Record honors with multi-student participant tagging.
- **Announcements Management**: Draft notices, toggle publish status, and upload banner graphics.
- **Photo Gallery Management**: Curate and upload class memories with event dates.
- **Resources Management**: Manage category-indexed learning links and shared files.
- **User & Access Management (RBAC)**: Manage administrators, lecturers, and class assistants with role-based permissions and active/inactive switches.
- **Class Settings & Branding**: Configure class name, academic year, motto/tagline, contact email, and official community channels (GitHub, Instagram, Discord).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Server Actions) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict mode, full type-safety) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens, glassmorphism, and responsive layout |
| **Database ORM** | [Prisma 6.19](https://www.prisma.io/) with PostgreSQL adapter |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (Compatible with Supabase, Neon, AWS RDS, Railway, or local Postgres) |
| **Authentication** | Lightweight stateless JWT session cookies via [jose](https://github.com/panva/jose) (`httpOnly`, `sameSite=lax`, `secure`) |
| **Validation** | [Zod v4](https://zod.dev/) for robust client/server input parsing |
| **Icons** | [Lucide React](https://lucide.dev/) + Custom SVG Brand Icons |
| **Security** | `bcryptjs` password hashing, RBAC permission checks, route protection via Next.js Middleware |

---

## 🔐 Role-Based Access Control (RBAC)

ClassHub enforces granular permissions across administrative roles:

| Role | Permissions & Scope |
|---|---|
| **ADMIN** | Full system access: manage users, settings, schedules, tasks, curriculum, students, content, and audit logs. |
| **CLASS_ADMIN** | Class administration: manage schedules, assignments, student directory, achievements, announcements, and gallery. |
| **LECTURER** | Academic manager: post tasks, assignments, announcements, and resources. |
| **ASSISTANT** | Teaching assistant: update task statuses, laboratory schedules, and assist student directory maintenance. |

### 🔑 Demo Credentials (Offline / First-Time Login)
If database connection is not yet configured, ClassHub includes built-in fallback authentication for immediate testing:
- **Email**: `admin@classhub.edu`
- **Password**: `AdminClassHub2026!`
- **Role**: `ADMIN`

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v20.x or v22.x+
- **npm** or **pnpm**
- (Optional) PostgreSQL database instance (e.g. [Supabase](https://supabase.com), [Neon](https://neon.tech), or local Docker)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd ProjectCampus
npm install
```

### 3. Environment Variables
Copy the template file to `.env`:
```bash
cp .env.example .env
```
Configure your environment parameters:
```env
```

### 4. Database Setup & Migrations
Generate Prisma Client:
```bash
npx prisma generate
```

Push schema to your database (when PostgreSQL is active):
```bash
npx prisma db push
```

Seed database with rich initial academic data:
```bash
npm run db:seed
```

> **Zero-Config Local Database Included**: ClassHub includes an embedded PostgreSQL engine powered by PGlite (`scripts/dev-db.mjs`) on port 5433. Simply running `npm run dev` automatically spins up both the embedded persistent database and Next.js. No Docker or external PostgreSQL installation is required for local development!
>
> **Note on Zero-Downtime Resilience**: If PostgreSQL is temporarily offline or unconfigured, ClassHub automatically switches to its comprehensive `initial-data.ts` fallback layer. The app will build and run without throwing unhandled exceptions.

### 5. Running Locally
Start the development server (automatically launches embedded database + Next.js):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Available development scripts:
- `npm run dev`: Starts both embedded PGlite DB and Next.js dev server.
- `npm run dev:db`: Starts only the embedded PGlite database server on port 5433.
- `npm run dev:next`: Starts only Next.js (when external DB or existing dev:db is active).
- `npm test`: Runs all unit and integration test suites via Vitest.
- `npm run db:push`: Synchronizes Prisma schema with the database.
- `npm run db:seed`: Seeds database with realistic cohort data and administrator accounts.

To verify production bundle compilation:
```bash
npm run build
npm run start
```

---

## 📁 Project Architecture

```
ProjectCampus/
├── prisma/
│   ├── schema.prisma              # Complete database schema & relationships
│   └── seed.ts                    # Database seeder with realistic class data
├── src/
│   ├── app/
│   │   ├── (public)/              # Public route group with PublicNav & Footer
│   │   │   ├── layout.tsx         # Public layout
│   │   │   ├── page.tsx           # Home landing page
│   │   │   ├── schedule/page.tsx  # Timetable schedule view
│   │   │   ├── tasks/page.tsx     # Coursework and assignments view
│   │   │   ├── students/          # Student directory & detail pages
│   │   │   ├── achievements/      # Achievements showcase
│   │   │   ├── announcements/     # Class bulletins
│   │   │   ├── gallery/           # Campus photo albums
│   │   │   └── resources/         # Download & link resources
│   │   ├── admin/                 # Protected admin management dashboard
│   │   │   ├── layout.tsx         # Server auth & permission check layout
│   │   │   ├── layout-client.tsx  # Admin responsive sidebar
│   │   │   ├── page.tsx           # Admin overview metrics
│   │   │   ├── schedule/          # Timetable management
│   │   │   ├── tasks/             # Assignment management
│   │   │   ├── subjects/          # Course curriculum management
│   │   │   ├── students/          # Student records management
│   │   │   ├── achievements/      # Honors management
│   │   │   ├── announcements/     # Bulletin manager
│   │   │   ├── gallery/           # Photo album manager
│   │   │   ├── resources/         # Link manager
│   │   │   ├── users/             # Team & RBAC manager
│   │   │   └── settings/          # Class identity & configuration
│   │   ├── login/page.tsx         # Glassmorphic admin sign-in page
│   │   ├── globals.css            # Complete design system & custom tokens
│   │   └── layout.tsx             # Root layout with Inter font
│   ├── components/
│   │   ├── public-nav.tsx         # Sticky public header with mobile navigation
│   │   ├── public-footer.tsx      # Multi-column footer with live settings
│   │   ├── icons.tsx              # Custom SVG brand icons (GitHub, LinkedIn, Discord)
│   │   └── admin/                 # Reusable admin UI primitives
│   │       ├── admin-header.tsx   # Consistent admin title bar
│   │       ├── modal.tsx          # Accessible modal dialog with backdrop
│   │       └── delete-dialog.tsx  # Confirmation dialog with pending transition
│   ├── lib/
│   │   ├── actions/               # Server Actions (Mutations & DB operations)
│   │   ├── auth/                  # JWT session management & bcrypt password hashing
│   │   ├── data/                  # Resilient data access layer with fallback
│   │   ├── permissions/           # RBAC matrix and role definitions
│   │   ├── validations/           # Zod schemas for all models
│   │   ├── db.ts                  # Prisma client singleton
│   │   └── utils.ts               # Utility helpers (formatDate, cn, relative deadlines)
│   └── middleware.ts              # Route protection for /admin routes
└── package.json
```

---

## 🔒 Security Best Practices Implemented

1. **HttpOnly Cookies**: Session tokens are encrypted and transmitted solely via secure, HTTP-only cookies to eliminate XSS token theft.
2. **Server-Side Authorization**: Every Server Action invokes `assertPermission(...)` before executing database mutations.
3. **Database Guardrails**: Deletion of the final active System Administrator is strictly blocked at the action level to prevent system lockout.
4. **Input Sanitization**: All form inputs are validated using strict Zod schemas with trim, character limits, and URL pattern enforcement.
5. **No Secrets in Bundles**: Sensitive variables (`DATABASE_URL`, `AUTH_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) are strictly server-only.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
