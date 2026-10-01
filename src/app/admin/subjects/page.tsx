import type { Metadata } from "next";
import { getSubjectsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { SubjectsManager } from "./subjects-manager";

export const metadata: Metadata = {
  title: "Course Subjects Management",
  description: "Manage university curriculum modules, SKS credits, and lecturer leads.",
};

export default async function AdminSubjectsPage() {
  const { subjects } = await getSubjectsData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Subjects & Modules"
        description="Configure academic coursework modules, credit values, syllabus goals, and professors."
      />
      <div>
        <SubjectsManager initialSubjects={subjects} />
      </div>
    </div>
  );
}
