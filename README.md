# ClassHub — Modern Class & Cohort Management Web Application

A modern web application for managing university class activities, academic schedules, student profiles, assignments, achievements, announcements, and shared learning resources.

ClassHub is designed to help students and class administrators organize academic information in one centralized, accessible, and responsive platform.

---

## 🌟 Key Features

### 🎓 Public Portal

- **Interactive Home Dashboard** — Overview of today's schedule, upcoming deadlines, achievements, announcements, featured students, and class activities.
- **Weekly Schedule (`/schedule`)** — Weekly timetable with course names, class times, room locations, and lecturer information.
- **Tasks & Deadlines (`/tasks`)** — View assignments, deadlines, task priorities, and completion status.
- **Student Directory (`/students`)** — Browse student profiles, biographies, career aspirations, portfolio links, and social media.
- **Student Details (`/students/[id]`)** — Individual profiles with personal introductions, motivation, career goals, and achievements.
- **Achievements (`/achievements`)** — Showcase academic accomplishments, competitions, volunteering, technology projects, and leadership activities.
- **Announcements (`/announcements`)** — Centralized class announcements and academic updates.
- **Class Gallery (`/gallery`)** — Photos and memories from class activities, workshops, competitions, and gatherings.
- **Shared Resources (`/resources`)** — Useful links to learning materials, cloud storage, development tools, and academic resources.
- **About (`/about`)** — Information about the class, its identity, community, and background.

### 🛡️ Administrative Portal (`/admin`)

- **Dashboard** — Overview of students, subjects, assignments, achievements, and announcements.
- **Schedule Management** — Create, update, and delete class schedules.
- **Task Management** — Manage assignments, priorities, deadlines, and completion status.
- **Subject Management** — Maintain course codes, subject details, and lecturer information.
- **Student Management** — Manage student profiles, biographies, career aspirations, and social links.
- **Achievement Management** — Record accomplishments and associate participating students.
- **Announcement Management** — Create announcements and control publication status.
- **Gallery Management** — Organize class photos and activity documentation.
- **Resource Management** — Maintain shared links and learning resources.
- **User Management** — Manage administrative accounts and role-based access, where configured.
- **Class Settings** — Configure class information, branding, and community links, where supported.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) with App Router |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Database ORM | [Prisma](https://www.prisma.io/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| Authentication | [jose](https://github.com/panva/jose), if configured |
| Validation | [Zod](https://zod.dev/) |
| Icons | [Lucide](https://lucide.dev/) |
| Password Hashing | `bcryptjs`, if configured |

> **Note:** Confirm the installed package versions and enabled features against `package.json`, the Prisma schema, and the application source code.

---

## 🔐 Role-Based Access Control (RBAC)

ClassHub can use role-based permissions to separate administrative responsibilities. The exact roles and their permissions depend on the current application configuration.

| Role | Intended Scope |
|---|---|
| `ADMIN` | Full system administration and access management |
| `CLASS_ADMIN` | Class operations, schedules, students, and class content |
| `LECTURER` | Academic tasks, announcements, and learning resources |
| `ASSISTANT` | Assistance with academic and class administration |

Only document roles that are actually implemented and enforced on the server.

---

## 🚀 Getting Started

### 1. Prerequisites

Install the following tools:

- [Node.js](https://nodejs.org/) compatible with the project dependencies
- npm, pnpm, or the package manager specified by the repository
- A PostgreSQL database, such as [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or a local PostgreSQL instance

### 2. Clone the Repository

Replace the example URL with your actual GitHub repository URL.

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a local `.env` file based on `.env.example`, if the repository provides one.

```env
DATABASE_URL="your-postgresql-connection-string"
AUTH_SECRET="your-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Update the values according to your environment and the variables required by the application.

**Security notes:**
- Never commit `.env` files containing secrets.
- Keep database credentials and authentication secrets private.
- Use separate environment variables for local development, preview deployments, and production.
- Use a strong, randomly generated authentication secret.

### 5. Set Up the Database

Run only the commands supported by the repository's `package.json` and Prisma configuration.

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply database changes using the project's established workflow. For a project using Prisma migrations:

```bash
npx prisma migrate dev
```

If the project intentionally uses `prisma db push` during development, follow that workflow instead.

To seed initial data, run the configured seed command, if available:

```bash
npm run db:seed
```

> **Important:** Verify database setup instructions before running commands against production. Do not reset or overwrite a production database to initialize the application.

### 6. Run the Development Server

```bash
npm run dev
```

Open the application at:

- Public website: [http://localhost:3000](http://localhost:3000)
- Login page: [http://localhost:3000/login](http://localhost:3000/login)
- Admin portal: [http://localhost:3000/admin](http://localhost:3000/admin), subject to authentication and permissions

### 7. Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

The following is an illustrative structure. Update it to match the actual repository.

```text
classhub/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── scripts/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── schedule/
│   │   │   ├── tasks/
│   │   │   ├── students/
│   │   │   ├── achievements/
│   │   │   ├── announcements/
│   │   │   ├── gallery/
│   │   │   ├── resources/
│   │   │   └── about/
│   │   ├── admin/
│   │   ├── login/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── admin/
│   │   └── ui/
│   ├── lib/
│   │   ├── actions/
│   │   ├── auth/
│   │   ├── data/
│   │   ├── permissions/
│   │   └── validations/
│   └── middleware.ts
├── .env.example
├── package.json
└── README.md
```

---

## 🔒 Security Best Practices

- **Protected Credentials:** Store secrets in environment variables and never expose them in client-side code.
- **Password Security:** Hash passwords securely before storing them.
- **Server-Side Authorization:** Validate permissions on the server for every protected data mutation.
- **Input Validation:** Validate incoming data before processing or saving it.
- **Public Profile Privacy:** Publish only student information intended for public display. Avoid exposing student identification numbers or other sensitive data unnecessarily.
- **Safe Database Operations:** Use migrations and backups when modifying production data.
- **Session Security:** Configure authentication cookies and session handling appropriately for the deployment environment.

---

## 🌐 Deployment

ClassHub can be deployed to a platform that supports Next.js, such as [Vercel](https://vercel.com/).

General deployment workflow:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the required production environment variables.
4. Connect the production PostgreSQL database.
5. Apply the required database migrations using the project's deployment workflow.
6. Deploy the application.
7. Verify public pages, authentication, admin permissions, and database-backed features.

Make sure the production database is correctly configured. A successful deployment does not automatically mean that the application is connected to the intended database.

---

## 🧪 Available Scripts

Check `package.json` for the commands available in your project.

Common scripts include:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run linting, if configured |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Apply development database migrations |
| `npm run db:seed` | Seed initial data, if configured |

---

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your changes with a descriptive message.
5. Open a pull request.

Please avoid committing credentials, private student information, or production database records.

---

## 📄 License

Add a `LICENSE` file and specify the project's license before distributing or reusing the code.

---

**ClassHub** — Bringing classmates, academic activities, and shared knowledge together in one place.
