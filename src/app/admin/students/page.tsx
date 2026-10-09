import type { Metadata } from "next";
import { getStudentsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { StudentsManager } from "./students-manager";

export const metadata: Metadata = {
  title: "Class Directory Management",
  description: "Maintain student member profiles, bios, and contacts.",
};

export default async function AdminStudentsPage() {
  const { students } = await getStudentsData(undefined, { includePrivate: true });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Students Directory"
        description="Manage enrolled student records, personal portfolios, and academic profiles."
      />
      <div>
        <StudentsManager initialStudents={students} />
      </div>
    </div>
  );
}
