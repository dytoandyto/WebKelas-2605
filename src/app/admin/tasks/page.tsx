import type { Metadata } from "next";
import { getTasksData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { TasksManager } from "./tasks-manager";

export const metadata: Metadata = {
  title: "Class Tasks & Assignments Management",
  description: "Track deadlines, coursework, and assignment submissions.",
};

export default async function AdminTasksPage() {
  const { tasks, subjects } = await getTasksData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Tasks & Assignments"
        description="Monitor homework deadlines, lab assessments, and milestone submissions."
      />
      <div>
        <TasksManager initialTasks={tasks} subjects={subjects} />
      </div>
    </div>
  );
}
