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
    <div className="bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="hero-gradient text-white py-14 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-cyan-400/30 rounded-full px-4 py-1 text-xs font-semibold mb-4 text-cyan-200">
            <Trophy size={13} className="text-amber-300" />
            <span>Hall of Fame &bull; {achievements.length} Accolades</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Class Achievements
          </h1>
          <p className="text-cyan-100 text-sm sm:text-base max-w-2xl leading-relaxed">
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
