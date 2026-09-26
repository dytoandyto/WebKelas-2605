import type { Metadata } from "next";
import { getStudentsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { StudentsManager } from "./students-manager";

export const metadata: Metadata = {
  title: "Class Directory Management",
  description: "Maintain student member profiles, bios, and contacts.",
};

export default async function AdminStudentsPage() {
  const { students, majors } = await getStudentsData();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        title="Students Directory"
        description="Manage enrolled student records, personal portfolios, and academic majors."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <StudentsManager initialStudents={students} majors={majors} />
      </div>
    </div>
  );
}
