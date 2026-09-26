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
    getStudentsData(),
  ]);

  const studentOptions = students.map((s: any) => ({
    id: s.id,
    name: s.name,
    studentNumber: s.studentNumber,
    photoUrl: s.photoUrl,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        title="Class Achievements"
        description="Celebrate hackathons, research publications, certifications, and academic trophies."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <AchievementsManager
          initialAchievements={achievements}
          allStudents={studentOptions}
        />
      </div>
    </div>
  );
}
