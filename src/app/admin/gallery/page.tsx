import type { Metadata } from "next";
import { getGalleryData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { GalleryManager } from "./gallery-manager";

export const metadata: Metadata = {
  title: "Class Photo & Media Gallery",
  description: "Upload, curate, and organize class photo moments and documentations.",
};

export default async function AdminGalleryPage() {
  const { gallery } = await getGalleryData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Photo & Media Gallery"
        description="Preserve class memories, event photo albums, and memorable community documentations."
      />
      <div>
        <GalleryManager initialGallery={gallery} />
      </div>
    </div>
  );
}
