import type { Metadata } from "next";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { getTasksData } from "@/lib/data";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { formatDate, getRelativeDeadline, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tasks",
  description: "View all class tasks, deadlines, and assignments.",
};

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  HIGH: "badge-red",
  MEDIUM: "badge-amber",
  LOW: "badge-gray",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  UPCOMING: <Circle size={14} className="text-brand-500" />,
  DUE_SOON: <Clock size={14} className="text-amber-500" />,
  COMPLETED: <CheckCircle2 size={14} className="text-emerald-500" />,
  OVERDUE: <AlertCircle size={14} className="text-red-500" />,
};

export default async function TasksPage() {
  const { tasks, subjects } = await getTasksData();

  const groupedByStatus = {
    OVERDUE: tasks.filter((t: any) => t.computedStatus === TaskStatus.OVERDUE),
    DUE_SOON: tasks.filter((t: any) => t.computedStatus === TaskStatus.DUE_SOON),
    UPCOMING: tasks.filter((t: any) => t.computedStatus === TaskStatus.UPCOMING),
    COMPLETED: tasks.filter((t: any) => t.computedStatus === TaskStatus.COMPLETED || t.status === TaskStatus.COMPLETED),
  };

  const totalActive = groupedByStatus.OVERDUE.length + groupedByStatus.DUE_SOON.length + groupedByStatus.UPCOMING.length;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <CheckSquare className="text-white" size={20} />
            </div>
            <div>
              <h1 className="page-title">Tasks & Assignments</h1>
              <p className="text-slate-500 text-sm">
                {totalActive} active task{totalActive !== 1 ? "s" : ""} &bull; {tasks.length} total
              </p>
            </div>
          </div>

          {/* Status summary pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {groupedByStatus.OVERDUE.length > 0 && (
              <span className="badge badge-red">
                <AlertCircle size={11} />
                {groupedByStatus.OVERDUE.length} Overdue
              </span>
            )}
            {groupedByStatus.DUE_SOON.length > 0 && (
              <span className="badge badge-amber">
                <Clock size={11} />
                {groupedByStatus.DUE_SOON.length} Due Soon
              </span>
            )}
            <span className="badge badge-blue">
              <Circle size={11} />
              {groupedByStatus.UPCOMING.length} Upcoming
            </span>
            {groupedByStatus.COMPLETED.length > 0 && (
              <span className="badge badge-green">
                <CheckCircle2 size={11} />
                {groupedByStatus.COMPLETED.length} Completed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {tasks.length === 0 ? (
          <div className="card p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-slate-600 font-semibold">No tasks yet</h3>
            <p className="text-slate-400 text-sm mt-1">Tasks and assignments will appear here.</p>
          </div>
        ) : (
          <>
            {/* Overdue */}
            {groupedByStatus.OVERDUE.length > 0 && (
              <TaskGroup
                title="⚠️ Overdue"
                description="These deadlines have passed"
                tasks={groupedByStatus.OVERDUE}
                headerClass="text-red-700"
                borderClass="border-l-red-500"
              />
            )}

            {/* Due Soon */}
            {groupedByStatus.DUE_SOON.length > 0 && (
              <TaskGroup
                title="⏳ Due Soon"
                description="Due within the next 3 days"
                tasks={groupedByStatus.DUE_SOON}
                headerClass="text-amber-700"
                borderClass="border-l-amber-400"
              />
            )}

            {/* Upcoming */}
            {groupedByStatus.UPCOMING.length > 0 && (
              <TaskGroup
                title="📋 Upcoming"
                description="Scheduled tasks and assignments"
                tasks={groupedByStatus.UPCOMING}
                headerClass="text-brand-700"
                borderClass="border-l-brand-400"
              />
            )}

            {/* Completed */}
            {groupedByStatus.COMPLETED.length > 0 && (
              <TaskGroup
                title="✅ Completed"
                description="Finished tasks"
                tasks={groupedByStatus.COMPLETED}
                headerClass="text-slate-500"
                borderClass="border-l-slate-300"
                dimmed
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskGroup({
  title,
  description,
  tasks,
  headerClass,
  borderClass,
  dimmed = false,
}: {
  title: string;
  description: string;
  tasks: any[];
  headerClass?: string;
  borderClass?: string;
  dimmed?: boolean;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className={cn("text-lg font-bold", headerClass)}>{title}</h2>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <div className="space-y-3">
        {tasks.map((task: any) => {
          const rel = getRelativeDeadline(task.deadline);
          return (
            <div
              key={task.id}
              className={cn(
                "card p-5 border-l-4",
                borderClass,
                dimmed && "opacity-70"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="badge badge-gray">{task.subject?.code}</span>
                    <span className={cn("badge", PRIORITY_BADGE[task.priority as TaskPriority])}>
                      {PRIORITY_LABEL[task.priority as TaskPriority]}
                    </span>
                    <span
                      className={cn(
                        "badge",
                        rel.isOverdue ? "badge-red" : rel.isDueSoon ? "badge-amber" : dimmed ? "badge-green" : "badge-blue"
                      )}
                    >
                      {rel.text}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 leading-snug">{task.title}</h3>
                  {task.description && (
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      Deadline: {formatDate(task.deadline)}
                    </span>
                    <span>{task.subject?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
