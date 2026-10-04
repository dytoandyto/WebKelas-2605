import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckSquare,
  Clock,
  ArrowLeft,
  Calendar,
  Users,
  Paperclip,
  ExternalLink,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle2,
  Circle,
  Building,
} from "lucide-react";
import { getTaskById } from "@/lib/data";
import { formatDate, getRelativeDeadline, cn } from "@/lib/utils";
import { TaskStatus, TaskPriority, TaskType } from "@prisma/client";
import { DeadlineBadge } from "@/components/ui/badge";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TaskDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskById(id);
  if (!task) {
    return { title: "Tugas Tidak Ditemukan | JS1SI-26-REG-05" };
  }
  return {
    title: `${task.title} | JS1SI-26-REG-05`,
    description: task.description || `Detail tugas perkuliahan ${task.title} kelas JS1SI-26-REG-05.`,
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  const relative = getRelativeDeadline(task.deadline);
  const isCompleted = task.status === TaskStatus.COMPLETED || task.computedStatus === TaskStatus.COMPLETED;

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar Tugas</span>
        </Link>

        {/* Task Header Card */}
        <div className="card p-6 sm:p-8 bg-[#08152e]/90 light:bg-white border-cyan-500/25 light:border-slate-200 backdrop-blur-xl shadow-xl space-y-5">
          {/* Top badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {task.subject ? (
                <Link
                  href={`/subjects/${task.subject.code}`}
                  className="px-3 py-1 rounded-lg bg-cyan-500/15 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 font-mono text-xs font-bold hover:bg-cyan-500/25 transition-colors"
                >
                  {task.subject.code} &mdash; {task.subject.name}
                </Link>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700 font-mono text-xs">
                  Tugas Umum
                </span>
              )}

              <span className={cn(
                "px-2.5 py-1 rounded text-xs font-mono font-bold uppercase",
                task.taskType === TaskType.GROUP
                  ? "bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700 border border-purple-500/30"
                  : task.taskType === TaskType.ADDITIONAL
                  ? "bg-teal-500/15 light:bg-teal-50 text-teal-300 light:text-teal-700 border border-teal-500/30"
                  : "bg-blue-500/15 light:bg-blue-50 text-blue-300 light:text-blue-700 border border-blue-500/30"
              )}>
                [{task.taskType || "INDIVIDUAL"}]
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DeadlineBadge deadline={task.deadline} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 font-display">
            {task.title}
          </h1>

          {/* Timing details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 light:text-slate-500 font-mono">Tenggat Waktu:</span>
              <div className="font-bold text-white light:text-slate-900 flex items-center gap-1.5">
                <Calendar size={13} className="text-cyan-400 light:text-blue-600" />
                <span>{formatDate(task.deadline)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 light:text-slate-500 font-mono">Sisa Waktu:</span>
              <div className="font-bold text-cyan-300 light:text-blue-700 flex items-center gap-1.5">
                <Clock size={13} className="text-cyan-400 light:text-blue-600" />
                <span>{relative.text}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 light:text-slate-500 font-mono">Estimasi Pengerjaan:</span>
              <div className="font-bold text-slate-200 light:text-slate-800">
                {task.estimatedTime || "Fleksibel"}
              </div>
            </div>
          </div>

          {/* Overdue Alert Banner */}
          {(relative.isOverdue || task.computedStatus === TaskStatus.OVERDUE) && !isCompleted && (
            <div className="p-4 rounded-xl bg-rose-500/10 light:bg-rose-50 border border-rose-500/30 light:border-rose-200 text-xs flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-400 light:text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-rose-300 light:text-rose-800 text-sm">
                  Tenggat Waktu Sudah Berakhir (Sudah Lewat)
                </div>
                <p className="text-rose-200/90 light:text-rose-700 leading-relaxed">
                  Batas waktu pengumpulan untuk penugasan ini telah berakhir ({relative.text}). Tautan pengumpulan pada LMS Telkom / Classroom mungkin telah ditutup secara otomatis. Silakan hubungi dosen pengampu atau pengurus kelas jika Anda membutuhkan perpanjangan waktu.
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 light:text-blue-700">
                // Instruksi &amp; Deskripsi Tugas
              </h3>
              <div className="p-4 rounded-xl bg-[#040813]/40 light:bg-slate-50 border border-cyan-500/10 light:border-slate-200 text-sm text-slate-200 light:text-slate-800 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}

          {/* Group Details */}
          {task.groupName && (
            <div className="p-4 rounded-xl bg-purple-950/30 light:bg-purple-50 border border-purple-500/30 light:border-purple-200 space-y-2">
              <div className="font-bold text-purple-300 light:text-purple-700 flex items-center gap-2 text-sm font-mono">
                <Users size={15} />
                <span>Penugasan Kelompok: {task.groupName}</span>
              </div>
              {task.groupMembers && (
                <p className="text-xs text-purple-200/90 light:text-purple-700/90 leading-relaxed">
                  <strong>Anggota Terdaftar:</strong> {task.groupMembers}
                </p>
              )}
            </div>
          )}

          {/* External Links & Submission */}
          <div className="flex flex-wrap gap-3 pt-2">
            {task.submissionUrl && (
              <a
                href={task.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <span>Kumpulkan Tugas (Submission Link)</span>
                <ExternalLink size={13} />
              </a>
            )}
            {task.referenceUrl && (
              <a
                href={task.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <span>Link Referensi / Sumber</span>
                <ExternalLink size={13} />
              </a>
            )}
            {task.attachmentUrl && (
              <a
                href={task.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <Paperclip size={13} />
                <span>Lampiran Berkas</span>
              </a>
            )}
          </div>
        </div>

        {/* Related Daily Notes */}
        {task.dailyNotes && task.dailyNotes.length > 0 && (
          <div className="card p-6 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-cyan-400 light:text-blue-600" />
              <span>Catatan Harian Terkait Tugas Ini</span>
            </h3>
            <div className="space-y-2.5">
              {task.dailyNotes.map(({ dailyNote }: any) => (
                <Link
                  key={dailyNote.id}
                  href={`/daily-notes/${dailyNote.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 hover:border-cyan-400/40 transition-colors text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white light:text-slate-900">{dailyNote.title}</h4>
                    <p className="text-[11px] text-slate-400 light:text-slate-500 font-mono mt-0.5">{formatDate(dailyNote.date)}</p>
                  </div>
                  <span className="text-cyan-400 light:text-blue-600 font-bold">Buka &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
