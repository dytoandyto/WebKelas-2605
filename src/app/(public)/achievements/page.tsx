import type { Metadata } from "next";
import { getAchievementsData, getSettings } from "@/lib/data";
import { AchievementsView } from "./achievements-view";
import { PageHeader, ContentContainer } from "@/components/shared";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Hall of Fame & Prestasi — ${settings.className}`,
    description: `Daftar prestasi kompetisi, publikasi ilmiah, dan kepemimpinan mahasiswa kelas ${settings.className} Telkom University Jakarta.`,
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
          badge={`HALL OF FAME • ${classCode}`}
          title="Prestasi & Penghargaan"
          description={`Rekam jejak kemenangan kompetisi, inovasi teknologi, karya kreatif, dan kontribusi kepemimpinan mahasiswa ${classCode}.`}
          breadcrumbs={[{ label: "Prestasi Kelas" }]}
        />

        <AchievementsView initialAchievements={achievements as any} />
      </ContentContainer>
    </div>
  );
}
