import type { Metadata } from "next";
import { getResourcesData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { ResourcesManager } from "./resources-manager";

export const metadata: Metadata = {
  title: "Campus Resources Directory",
  description: "Curate links to university portals, tools, repositories, and learning assets.",
};

export default async function AdminResourcesPage() {
  const { resources } = await getResourcesData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Campus Academic Resources"
        description="Maintain useful links to Telkom University LMS, library catalogs, software tools, and academic guides."
      />
      <div>
        <ResourcesManager initialResources={resources} />
      </div>
    </div>
  );
}
