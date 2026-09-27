import { Suspense } from "react";
import type { Metadata } from "next";
import { getTasksData, getSettings } from "@/lib/data";
import { TasksView } from "@/components/tasks/tasks-view";
import { PageHeader, ContentContainer, TaskTableSkeleton } from "@/components/shared";

export const metadata: Metadata = {
  title: "Tugas & Penugasan | JS1SI-26-REG-05",
  description:
    "Workspace tugas akademik komprehensif untuk kelas JS1SI-26-REG-05 S1 Sistem Informasi Telkom University Jakarta — Tabel, Kanban Board, Kalender, dan List View.",
};

export default async function TasksPage() {
  const [{ tasks, subjects }, settings] = await Promise.all([
    getTasksData(),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";
  const academicYear = settings.semester || "Semester Ganjil 2026/2027";

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge={`ACADEMIC PLANNER • ${classCode}`}
          title="Tugas & Penugasan"
          description={`Lacak penugasan individu, proyek kelompok, deadline, dan progress akademik ${classCode} (${academicYear}).`}
          breadcrumbs={[{ label: "Tugas Akademik" }]}
        />

        <Suspense fallback={<TaskTableSkeleton />}>
          <TasksView tasks={tasks as any} subjects={subjects as any} />
        </Suspense>
      </ContentContainer>
    </div>
  );
}
