import { Suspense } from "react";
import type { Metadata } from "next";
import { getTasksData, getSettings } from "@/lib/data";
import { TasksView } from "@/components/tasks/tasks-view";
import { PageHeader, ContentContainer, TaskTableSkeleton } from "@/components/shared";

interface TasksPageProps {
  searchParams?: Promise<{
    tab?: string;
    view?: string;
    subject?: string;
    q?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: TasksPageProps): Promise<Metadata> {
  const resolved = searchParams ? await searchParams : {};
  const isHistory = resolved.tab === "history";

  return {
    title: isHistory
      ? "Riwayat Tugas | JS1SI-26-REG-05"
      : "Tugas & Deadline | JS1SI-26-REG-05",
    description: isHistory
      ? "Arsip tugas perkuliahan kelas JS1SI-26-REG-05 yang telah selesai atau lewat tenggat."
      : "Daftar tugas kuliah dan deadline pengumpulan kelas JS1SI-26-REG-05 Telkom University Jakarta.",
  };
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentTab = resolvedSearchParams.tab === "history" ? "history" : "upcoming";

  // Database-level filtered query: only fetches relevant scope (Upcoming vs History)
  const [{ tasks, subjects, upcomingCount, historyCount }, settings] = await Promise.all([
    getTasksData({ scope: currentTab }),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";
  const academicYear = settings.semester || "Semester Ganjil 2026/2027";

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge={`TUGAS • ${classCode}`}
          title={currentTab === "history" ? "Riwayat Tugas" : "Tugas & Deadline"}
          description={
            currentTab === "history"
              ? `Arsip tugas perkuliahan ${classCode} (${academicYear}) yang telah selesai atau melewati batas tenggat.`
              : `Tugas yang perlu diingat dan diselesaikan bersama untuk kelas ${classCode} (${academicYear}). Jangan sampai kelewatan.`
          }
          breadcrumbs={[
            { label: "Tugas & Deadline", href: "/tasks" },
            ...(currentTab === "history" ? [{ label: "Riwayat" }] : []),
          ]}
        />

        <Suspense key={currentTab} fallback={<TaskTableSkeleton />}>
          <TasksView
            tasks={tasks as any}
            subjects={subjects as any}
            currentTab={currentTab}
            upcomingCount={upcomingCount}
            historyCount={historyCount}
          />
        </Suspense>
      </ContentContainer>
    </div>
  );
}
