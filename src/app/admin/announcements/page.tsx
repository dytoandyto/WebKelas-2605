import type { Metadata } from "next";
import { getAnnouncementsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { AnnouncementsManager } from "./announcements-manager";

export const metadata: Metadata = {
  title: "Class Announcements Management",
  description: "Publish class notices, announcements, and bulletins.",
};

export default async function AdminAnnouncementsPage() {
  const { announcements } = await getAnnouncementsData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Class Announcements"
        description="Draft, publish, and broadcast notices to all enrolled students and visitors."
      />
      <div>
        <AnnouncementsManager initialAnnouncements={announcements} />
      </div>
    </div>
  );
}
