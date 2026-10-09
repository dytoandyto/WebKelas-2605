import type { Metadata } from "next";
import Link from "next/link";
import { Info, ArrowRight } from "lucide-react";
import { getSettings } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Class Settings & Metadata",
  description: "Configure class identity, academic year, motto, and community social links.",
};

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Class Configuration"
        description="Update class information, cohort details, branding motto, and social channel links."
      >
        <Link
          href="/admin/about"
          className="btn btn-secondary btn-sm flex items-center gap-1.5"
        >
          <Info size={14} />
          <span>Kelola Halaman Tentang</span>
        </Link>
      </AdminHeader>

      <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Info size={16} />
          </div>
          <div>
            <h4 className="font-semibold text-text-primary">Ingin mengedit konten Halaman Tentang (About)?</h4>
            <p className="text-xs text-text-secondary">
              Atur visi & misi, nilai utama, kepengurusan kelas, serta sambutan wali dosen secara mendalam.
            </p>
          </div>
        </div>
        <Link
          href="/admin/about"
          className="btn btn-primary btn-sm flex items-center justify-center gap-1.5 text-xs shrink-0"
        >
          <span>Buka Editor Halaman Tentang</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div>
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}

