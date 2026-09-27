import type { Metadata } from "next";
import { getSubjectsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { SubjectsManager } from "./subjects-manager";

export const metadata: Metadata = {
  title: "Subjects & Courses Management",
  description: "Manage curriculum subjects, lecturers, and courses.",
};

export default async function AdminSubjectsPage() {
  const { subjects } = await getSubjectsData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/40 text-text-primary">
      <AdminHeader
        title="Subjects & Courses"
        description="Configure academic subjects, syllabus descriptions, and lecturer assignments."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <SubjectsManager initialSubjects={subjects} />
      </div>
    </div>
  );
}
