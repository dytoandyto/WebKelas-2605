import type { Metadata } from "next";
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
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        title="Class Configuration"
        description="Update class information, cohort details, branding motto, and social channel links."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
