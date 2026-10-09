import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";
import { getHomepageDraftPayload } from "@/lib/homepage/storage";
import { AdminHeader } from "@/components/admin/admin-header";
import { HomepageBuilder } from "@/components/admin/homepage-builder/homepage-builder";

export const metadata: Metadata = {
  title: "Homepage Builder & Visual CMS | Admin WebKelas",
  description: "Kelola susunan, visibilitas, urutan drag-and-drop, dan konten seluruh section homepage publik.",
};

export default async function AdminHomepageBuilderPage() {
  const { config, meta } = await getHomepageDraftPayload();

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
          <span>Website</span>
          <span>&rsaquo;</span>
          <span className="text-brand-600 dark:text-brand-400 font-semibold">Homepage Builder</span>
        </div>
        <AdminHeader
          title="Homepage Builder"
          description="Atur susunan section, urutan drag-and-drop, visibilitas tampil/sembunyi, dan kustomisasi konten homepage publik tanpa menyentuh kode program."
        >
          <div className="flex items-center gap-2">
            <Link
              href="/admin/homepage-builder/preview"
              target="_blank"
              className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400"
            >
              <Eye size={14} />
              <span>Pratinjau Draft</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
            >
              <ExternalLink size={14} />
              <span>Lihat Live (Publik)</span>
            </Link>
          </div>
        </AdminHeader>
      </div>

      {/* Main CMS Builder */}
      <HomepageBuilder initialConfig={config} initialMeta={meta} />
    </div>
  );
}
