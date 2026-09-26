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
    <div className="cosmic-canvas min-h-screen text-slate-100 pb-20">
      {/* Header Banner */}
      <section className="relative py-16 px-4 border-b border-cyan-500/20 bg-[#060f22]/70 backdrop-blur-xl overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md">
            <Users size={13} className="text-cyan-400" />
            <span>Class Cohort &bull; {students.length} Members</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Student Directory
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
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
