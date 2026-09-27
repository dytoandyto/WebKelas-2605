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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/40 text-text-primary">
      <AdminHeader
        title="Tasks & Assignments"
        description="Monitor homework deadlines, lab assessments, and milestone submissions."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <TasksManager initialTasks={tasks} subjects={subjects} />
      </div>
    </div>
  );
}
