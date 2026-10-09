import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LayoutTemplate } from "lucide-react";
import { getSettings, getStudentsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { AboutEditor } from "./about-editor";

export const metadata: Metadata = {
  title: "Kelola Halaman Tentang (About) | Admin WebKelas",
  description: "Edit identitas kelas, visi misi, nilai utama, pengurus kelas, dan sambutan wali dosen.",
};

export default async function AdminAboutPage() {
  const [settings, { students }] = await Promise.all([
    getSettings(),
    getStudentsData(),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Kelola Halaman Tentang (About Page)"
        description="Atur identitas kelas, visi & misi, nilai utama, kepengurusan kelas, serta pesan sambutan wali dosen yang tampil di halaman Tentang publik."
      >
        <div className="flex items-center gap-2">
          <Link
            href="/admin/homepage-builder"
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <LayoutTemplate size={14} />
            <span>Homepage Builder</span>
          </Link>
          <Link
            href="/about"
            target="_blank"
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <ExternalLink size={14} />
            <span>Lihat Halaman Publik</span>
          </Link>
        </div>
      </AdminHeader>

      <AboutEditor initialSettings={settings} students={students} />
    </div>
  );
}
