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
    <div className="cosmic-canvas min-h-screen text-slate-100 pb-20">
      {/* Header */}
      <div className="relative py-14 px-4 border-b border-cyan-500/20 bg-[#060f22]/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Mission Control &bull; Deadlines</span>
          </div>
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-cyan-glow flex-shrink-0">
              <CheckSquare size={22} />
            </div>
            <div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Tasks & Assignments
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                {totalActive} active task{totalActive !== 1 ? "s" : ""} &bull; {tasks.length} total across the semester
              </p>
            </div>
          </div>

          {/* Status summary pills */}
          <div className="flex flex-wrap gap-2.5 mt-3">
            {groupedByStatus.OVERDUE.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/30">
                <AlertCircle size={13} className="text-rose-400" />
                {groupedByStatus.OVERDUE.length} Overdue
              </span>
            )}
            {groupedByStatus.DUE_SOON.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                <Clock size={13} className="text-amber-400" />
                {groupedByStatus.DUE_SOON.length} Due Soon
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              <Circle size={13} className="text-cyan-400" />
              {groupedByStatus.UPCOMING.length} Upcoming
            </span>
            {groupedByStatus.COMPLETED.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 size={13} className="text-emerald-400" />
                {groupedByStatus.COMPLETED.length} Completed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {tasks.length === 0 ? (
          <div className="cyber-card p-16 text-center rounded-2xl bg-[#0a1a2f]/60 border border-cyan-500/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-slate-200 font-semibold text-lg">No tasks yet</h3>
            <p className="text-slate-400 text-sm mt-1">Tasks and assignments will appear here once announced.</p>
          </div>
        ) : (
          <>
            {/* Overdue */}
            {groupedByStatus.OVERDUE.length > 0 && (
              <TaskGroup
                title="⚠️ Overdue Deadlines"
                description="These assignments have passed their submission window"
                tasks={groupedByStatus.OVERDUE}
                headerClass="text-rose-400"
                borderClass="border-rose-500/40 bg-rose-950/20"
              />
            )}

            {/* Due Soon */}
            {groupedByStatus.DUE_SOON.length > 0 && (
              <TaskGroup
                title="⏳ Priority Deadlines (Due Soon)"
                description="Upcoming within the next 3 days"
                tasks={groupedByStatus.DUE_SOON}
                headerClass="text-amber-400"
                borderClass="border-amber-500/40 bg-amber-950/20"
              />
            )}

            {/* Upcoming */}
            {groupedByStatus.UPCOMING.length > 0 && (
              <TaskGroup
                title="📋 Scheduled Tasks"
                description="Standard assignments and project deliverables"
                tasks={groupedByStatus.UPCOMING}
                headerClass="text-cyan-300"
                borderClass="border-cyan-500/30"
              />
            )}

            {/* Completed */}
            {groupedByStatus.COMPLETED.length > 0 && (
              <TaskGroup
                title="✅ Completed Mission Archive"
                description="Finished coursework and deliverables"
                tasks={groupedByStatus.COMPLETED}
                headerClass="text-slate-400"
                borderClass="border-slate-700/50"
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
    <section className="space-y-4">
      <div>
        <h2 className={cn("text-xl font-extrabold tracking-tight", headerClass)}>{title}</h2>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
      <div className="space-y-3.5">
        {tasks.map((task: any) => {
          const rel = getRelativeDeadline(task.deadline);
          return (
            <div
              key={task.id}
              className={cn(
                "cyber-card p-5 rounded-2xl bg-[#0a1a2f]/70 border transition-all duration-300",
                borderClass,
                dimmed ? "opacity-60" : "hover:border-cyan-400/50 hover:-translate-y-0.5"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#061021] text-cyan-300 border border-cyan-500/30">
                      {task.subject?.code}
                    </span>
                    <span className={cn("badge text-xs", PRIORITY_BADGE[task.priority as TaskPriority])}>
                      {PRIORITY_LABEL[task.priority as TaskPriority]} Priority
                    </span>
                    <span
                      className={cn(
                        "badge text-xs",
                        rel.isOverdue ? "badge-red" : rel.isDueSoon ? "badge-amber" : dimmed ? "badge-green" : "badge-blue"
                      )}
                    >
                      {rel.text}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-base leading-snug">{task.title}</h3>
                  {task.description && (
                    <p className="text-slate-300 text-sm mt-1.5 line-clamp-2 leading-relaxed">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-mono">
                      <Clock size={12} className="text-cyan-400" />
                      Deadline: {formatDate(task.deadline)}
                    </span>
                    <span>&bull;</span>
                    <span className="text-slate-300">{task.subject?.name}</span>
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
