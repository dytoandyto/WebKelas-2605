import type { Metadata } from "next";
import { getStudentsData, getSettings } from "@/lib/data";
import { StudentsDirectory } from "./students-directory";
import { Users, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Students Directory — ${settings.className}`,
    description: `Meet the talented students and future tech leaders of ${settings.className}. Discover biographies, achievements, and portfolios.`,
  };
}

export default async function StudentsPage() {
  const [{ students, majors }, settings] = await Promise.all([
    getStudentsData(),
    getSettings(),
  ]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="hero-gradient text-white py-14 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-cyan-400/30 rounded-full px-4 py-1 text-xs font-semibold mb-4 text-cyan-200">
            <Users size={13} className="text-cyan-300" />
            <span>Class Cohort &bull; {students.length} Members</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Student Directory
          </h1>
          <p className="text-cyan-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            Explore the creative minds, aspiring engineers, and dedicated collaborators shaping our academic community.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <StudentsDirectory initialStudents={students} majors={majors} />
      </div>
    </div>
  );
}
