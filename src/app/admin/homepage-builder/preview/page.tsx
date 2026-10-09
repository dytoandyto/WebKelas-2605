import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { getHomepageDraftPayload } from "@/lib/homepage/storage";
import { getHomeData, getScheduleData } from "@/lib/data";
import { SectionRenderer, HomeDataProps } from "@/components/home/section-renderer";
import { ScheduleItem } from "@/components/schedule/schedule-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Pratinjau Draft Homepage | WebKelas Admin",
  description: "Mode pratinjau konfigurasi draft homepage WebKelas.",
};

export default async function HomepageDraftPreviewPage() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "SETTINGS_MANAGE")) {
    redirect("/admin");
  }

  const [draftPayload, homeData, scheduleData] = await Promise.all([
    getHomepageDraftPayload(),
    getHomeData(),
    getScheduleData(),
  ]);

  const schedules = scheduleData.schedules || [];

  return (
    <div className="relative min-h-screen">
      {/* Top Floating Preview Banner */}
      <div className="sticky top-0 z-50 w-full bg-amber-500/90 light:bg-amber-600/95 backdrop-blur-md text-amber-950 light:text-white px-4 py-2.5 shadow-lg border-b border-amber-600/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="p-1 rounded-md bg-amber-900/20 light:bg-amber-700/50">
              <Eye className="w-4 h-4 text-amber-950 light:text-white" />
            </span>
            <span>
              <strong>Mode Pratinjau Draft (v{draftPayload.meta.draftVersion})</strong> &bull; Perubahan ini belum dipublikasikan ke publik.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/homepage-builder">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-white/20 hover:bg-white/30 border-amber-900/30 light:border-white/30 text-amber-950 light:text-white cursor-pointer"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Kembali ke Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Actual Homepage Rendered with Draft Configuration */}
      <SectionRenderer
        sections={draftPayload.config.sections}
        homeData={homeData as unknown as HomeDataProps}
        schedules={schedules as unknown as ScheduleItem[]}
      />
    </div>
  );
}
