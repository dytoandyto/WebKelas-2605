import type { Metadata } from "next";
import { getScheduleData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { ScheduleManager } from "./schedule-manager";

export const metadata: Metadata = {
  title: "Class Schedule Management",
  description: "Create, view, and organize weekly recurring class sessions.",
};

export default async function AdminSchedulePage() {
  const { schedules, subjects } = await getScheduleData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Schedule Management"
        description="Organize class timetable slots, classroom venues, and lecturer assignments."
      />
      <div>
        <ScheduleManager initialSchedules={schedules} subjects={subjects} />
      </div>
    </div>
  );
}
