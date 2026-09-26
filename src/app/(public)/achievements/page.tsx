import type { Metadata } from "next";
import { getAchievementsData, getSettings } from "@/lib/data";
import { AchievementsView } from "./achievements-view";
import { Trophy, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Hall of Fame & Achievements — ${settings.className}`,
    description: `Discover competition triumphs, research publications, hackathon wins, and community honors achieved by ${settings.className}.`,
  };
}

export default async function AchievementsPage() {
  const [{ achievements }, settings] = await Promise.all([
    getAchievementsData(),
    getSettings(),
  ]);

  return (
    <div className="cosmic-canvas min-h-screen text-slate-100 pb-20">
      {/* Header Banner */}
      <section className="relative py-16 px-4 border-b border-cyan-500/20 bg-[#060f22]/70 backdrop-blur-xl overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md">
            <Trophy size={13} className="text-amber-400" />
            <span>Hall of Fame &bull; {achievements.length} Accolades</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Class Achievements
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Celebrating the competition victories, academic papers, open-source innovations, and community leadership of our cohort.
          </p>
        </div>
      </section>

      {/* Main View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AchievementsView initialAchievements={achievements} />
      </div>
    </div>
  );
}
