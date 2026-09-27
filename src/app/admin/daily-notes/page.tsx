import type { Metadata } from "next";
import { getDailyNotesData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { DailyNotesManager } from "./daily-notes-manager";

export const metadata: Metadata = {
  title: "Daily Notes Management | Admin JS1SI-26-REG-05",
  description: "Kelola jurnal akademik harian dan catatan pembelajaran kelas.",
};

export default async function AdminDailyNotesPage() {
  const { dailyNotes, subjects } = await getDailyNotesData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Jurnal Harian Kuliah"
        description="Kelola entri catatan harian perkuliahan, poin-poin penting, rangkuman materi, dan tindak lanjut pembelajaran."
      />
      <div className="max-w-7xl mx-auto">
        <DailyNotesManager
          initialNotes={dailyNotes as any}
          subjects={subjects as any}
        />
      </div>
    </div>
  );
}
