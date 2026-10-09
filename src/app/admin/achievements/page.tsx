import type { Metadata } from "next";
import { getAchievementsData, getStudentsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { AchievementsManager } from "./achievements-manager";

export const metadata: Metadata = {
  title: "Class Achievements Management",
  description: "Record and celebrate student achievements, competition prizes, and awards.",
};

export default async function AdminAchievementsPage() {
  const [{ achievements }, { students }] = await Promise.all([
    getAchievementsData(),
    getStudentsData(undefined, { includePrivate: true }),
  ]);

  const studentOptions = students.map((s: any) => ({
    id: s.id,
    name: s.name,
    studentNumber: s.studentNumber,
    photoUrl: s.photoUrl,
  }));

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Class Achievements"
        description="Celebrate hackathons, research publications, certifications, and academic trophies."
      />
      <div>
        <AchievementsManager
          initialAchievements={achievements}
          allStudents={studentOptions}
        />
      </div>
    </div>
  );
}
