import type { Metadata } from "next";
import { getClassEventsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { EventsManager } from "./events-manager";

export const metadata: Metadata = {
  title: "Class Events Management",
  description: "Schedule, coordinate, and organize non-recurring class activities, hackathons, and gatherings.",
};

export default async function AdminEventsPage() {
  const { events } = await getClassEventsData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Class Events & Activities"
        description="Manage workshops, guest lectures, hackathons, company visits, and social gatherings for your class."
      />
      <div>
        <EventsManager initialEvents={events} />
      </div>
    </div>
  );
}
