import type { Metadata } from "next";
import { getResourcesData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { ResourcesManager } from "./resources-manager";

export const metadata: Metadata = {
  title: "Class Resources Management",
  description: "Organize learning links, references, and shared drives.",
};

export default async function AdminResourcesPage() {
  const { resources } = await getResourcesData();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        title="Class Resources & Links"
        description="Curate tools, GitHub classrooms, textbooks, and cloud storage repositories."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <ResourcesManager initialResources={resources} />
      </div>
    </div>
  );
}
