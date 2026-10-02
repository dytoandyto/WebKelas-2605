import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Download,
  ExternalLink,
  User,
  FileText,
  CheckSquare,
  BookMarked,
  Tag,
  ChevronRight,
  Layers,
  Paperclip,
} from "lucide-react";
import { getMaterialById } from "@/lib/data";
import { formatDate, cn } from "@/lib/utils";

interface MaterialDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MaterialDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getMaterialById(id);
  if (!data || !data.material) {
    return { title: "Materi Tidak Ditemukan | JS1SI-26-REG-05" };
  }
  return {
    title: `${data.material.title} | JS1SI-26-REG-05`,
    description: data.material.description || `Materi perkuliahan ${data.material.title} kelas JS1SI-26-REG-05 Telkom University Jakarta.`,
  };
}

export default async function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  const { id } = await params;
  const data = await getMaterialById(id);

  if (!data || !data.material) {
    notFound();
  }

  const { material, relatedMaterials } = data;
  const subject = material.subject;

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/materials"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Repositori Materi</span>
        </Link>

        {/* Study Page Header Card */}
        <div className="card p-6 sm:p-10 bg-[#08152e]/90 light:bg-white border-cyan-500/25 light:border-slate-200 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700 border border-purple-500/30">
                {material.type}
              </span>
              {subject && (
                <Link
                  href={`/subjects/${subject.code}`}
                  className="px-3 py-1 rounded-lg bg-cyan-500/15 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 font-mono text-xs font-bold hover:bg-cyan-500/25 transition-colors"
                >
                  {subject.code} &mdash; {subject.name}
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 light:text-slate-500 font-mono">
              <Calendar size={13} className="text-cyan-400 light:text-blue-600" />
              <span>Diunggah: {formatDate(material.createdAt)}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white light:text-slate-900 font-display leading-tight">
            {material.title}
          </h1>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 light:text-slate-700 pt-2 border-t border-cyan-500/15 light:border-slate-100">
            {material.uploader && (
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-cyan-400 light:text-blue-600" />
                <span>Pengunggah: <strong>{material.uploader.name}</strong></span>
              </div>
            )}
            {material.fileName && (
              <div className="flex items-center gap-1.5 font-mono">
                <Paperclip size={13} className="text-cyan-400 light:text-blue-600" />
                <span>{material.fileName}</span>
              </div>
            )}
            {material.fileSize && (
              <div className="text-slate-400 light:text-slate-500 font-mono">
                ({material.fileSize})
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            {material.externalUrl && (
              <a
                href={material.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-md flex items-center gap-2"
              >
                <span>Buka Sumber Materi (Open Link)</span>
                <ExternalLink size={15} />
              </a>
            )}
            {material.fileUrl && (
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-md flex items-center gap-2"
              >
                <Download size={15} />
                <span>Unduh Berkas Materi</span>
              </a>
            )}
          </div>

          {/* Description / Summary */}
          {material.description && (
            <div className="space-y-3 pt-4 border-t border-cyan-500/15 light:border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 light:text-blue-700">
                // Ikhtisar &amp; Ringkasan Materi
              </h3>
              <div className="p-5 rounded-2xl bg-[#040813]/50 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 text-sm text-slate-200 light:text-slate-800 leading-relaxed whitespace-pre-wrap">
                {material.description}
              </div>
            </div>
          )}

          {/* Tags */}
          {material.tags && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-400 light:text-slate-500 font-mono flex items-center gap-1">
                <Tag size={12} /> Topik:
              </span>
              {material.tags.split(",").map((tag: string) => (
                <span
                  key={tag.trim()}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 light:bg-slate-100 text-cyan-300 light:text-slate-700 text-xs font-mono border border-cyan-500/20 light:border-slate-200"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Connected Study Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Related Tasks from Subject */}
          {(subject as any)?.tasks && (subject as any).tasks.length > 0 && (
            <div className="card p-6 bg-[#08152e]/85 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
                  <CheckSquare size={16} className="text-teal-400" />
                  <span>Tugas Terkait Mata Kuliah Ini</span>
                </h3>
                <Link
                  href="/tasks"
                  className="text-xs text-cyan-400 light:text-blue-600 hover:underline"
                >
                  Semua Tugas
                </Link>
              </div>

              <div className="space-y-2.5">
                {(subject as any).tasks.map((t: any) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="block p-3 rounded-xl bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 hover:border-cyan-400/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white light:text-slate-900">{t.title}</span>
                      <span className="text-[10px] font-mono text-cyan-300 light:text-blue-700">
                        {t.taskType || "INDIVIDUAL"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 light:text-slate-500 font-mono">
                      Tenggat: {formatDate(t.deadline)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 2. Related Daily Notes from Subject */}
          {(subject as any)?.dailyNotes && (subject as any).dailyNotes.length > 0 && (
            <div className="card p-6 bg-[#08152e]/85 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-emerald-400" />
                  <span>Catatan Harian Terkait</span>
                </h3>
                <Link
                  href="/daily-notes"
                  className="text-xs text-cyan-400 light:text-blue-600 hover:underline"
                >
                  Semua Catatan
                </Link>
              </div>

              <div className="space-y-2.5">
                {(subject as any).dailyNotes.map((note: any) => (
                  <Link
                    key={note.id}
                    href={`/daily-notes/${note.id}`}
                    className="block p-3 rounded-xl bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 hover:border-cyan-400/40 transition-colors"
                  >
                    <div className="font-bold text-white light:text-slate-900 text-xs mb-0.5">{note.title}</div>
                    <div className="text-[11px] text-slate-400 light:text-slate-500 font-mono">{formatDate(note.date)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Other Materials from same subject */}
        {relatedMaterials && relatedMaterials.length > 0 && (
          <div className="card p-6 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
              <BookMarked size={16} className="text-cyan-400 light:text-blue-600" />
              <span>Materi Lainnya di Mata Kuliah {subject?.name}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedMaterials.map((rm: any) => (
                <Link
                  key={rm.id}
                  href={`/materials/${rm.id}`}
                  className="p-4 rounded-xl bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 hover:border-cyan-400/40 transition-colors space-y-1.5 block group"
                >
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700">
                    {rm.type}
                  </span>
                  <h4 className="font-bold text-white light:text-slate-900 text-xs group-hover:text-cyan-300 light:group-hover:text-blue-600 transition-colors line-clamp-2">
                    {rm.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 light:text-slate-500 font-mono">{formatDate(rm.createdAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
