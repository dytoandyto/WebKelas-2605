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
    <div className="space-y-6">
      <AdminHeader
        title="Class Configuration"
        description="Update class information, cohort details, branding motto, and social channel links."
      />
      <div>
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
