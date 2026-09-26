import type { Metadata } from "next";
import { getGalleryData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { GalleryManager } from "./gallery-manager";

export const metadata: Metadata = {
  title: "Class Gallery Management",
  description: "Curate photos, workshop snapshots, and memories from class activities.",
};

export default async function AdminGalleryPage() {
  const { gallery } = await getGalleryData();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        title="Class Gallery"
        description="Upload and organize photo albums, study sessions, and campus events."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <GalleryManager initialGallery={gallery} />
      </div>
    </div>
  );
}
