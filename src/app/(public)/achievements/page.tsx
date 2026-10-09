import type { Metadata } from "next";
import { getAchievementsData, getSettings } from "@/lib/data";
import { AchievementsView } from "./achievements-view";
import { PageHeader, ContentContainer } from "@/components/shared";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Prestasi Kelas — ${settings.className || "JS1SI-26-REG-05"}`,
    description: `Daftar prestasi, karya, dan kebanggaan bersama teman-teman kelas ${settings.className} Telkom University Jakarta.`,
  };
}

export default async function AchievementsPage() {
  const [{ achievements }, settings] = await Promise.all([
    getAchievementsData(),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge={`PRESTASI • ${classCode}`}
          title="Prestasi Kelas"
          description={`Catatan prestasi, kompetisi, dan karya membanggakan yang diraih oleh teman-teman kelas ${classCode}.`}
          breadcrumbs={[{ label: "Prestasi Kelas" }]}
        />

        <AchievementsView initialAchievements={achievements as any} />
      </ContentContainer>
    </div>
  );
}
