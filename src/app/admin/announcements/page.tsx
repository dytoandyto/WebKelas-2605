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
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        title="Class Announcements"
        description="Draft, publish, and broadcast notices to all enrolled students and visitors."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <AnnouncementsManager initialAnnouncements={announcements} />
      </div>
    </div>
  );
}
