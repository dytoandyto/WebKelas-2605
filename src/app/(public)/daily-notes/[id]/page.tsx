import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileText,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckSquare,
  BookMarked,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  ListOrdered,
  Tag,
} from "lucide-react";
import { getDailyNoteById } from "@/lib/data";
import { formatDate, cn } from "@/lib/utils";

interface DailyNoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DailyNoteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getDailyNoteById(id);
  if (!data || !data.note) {
    return { title: "Catatan Tidak Ditemukan | JS1SI-26-REG-05" };
  }
  return {
    title: `${data.note.title} | Catatan Harian JS1SI-26-REG-05`,
    description: data.note.summary || `Catatan harian kelas JS1SI-26-REG-05: ${data.note.title}.`,
  };
}

export default async function DailyNoteDetailPage({ params }: DailyNoteDetailPageProps) {
  const { id } = await params;
  const data = await getDailyNoteById(id);

  if (!data || !data.note) {
    notFound();
  }

  const { note, prevNote, nextNote } = data;
  const subject = note.subject;

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-28 pt-28">
      {/* Container constrained to 760px - 820px for optimal long-form reading typography */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Back Navigation */}
        <Link
          href="/daily-notes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Jurnal Harian</span>
        </Link>

        {/* Article Header */}
        <header className="space-y-4 pb-6 border-b border-cyan-500/20 light:border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 light:bg-emerald-50 text-emerald-300 light:text-emerald-700 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <Calendar size={12} />
              <span>{formatDate(note.date)}</span>
            </span>

            {subject && (
              <Link
                href={`/subjects/${subject.code}`}
                className="px-3 py-1 rounded-full bg-cyan-500/10 light:bg-blue-50 text-cyan-300 light:text-blue-700 border border-cyan-500/20 light:border-blue-200 text-xs font-mono font-bold hover:bg-cyan-500/20 transition-colors"
              >
                {subject.code} &bull; {subject.name}
              </Link>
            )}

            {(note as any)?.mood && (
              <span className="px-2.5 py-1 rounded-full bg-slate-800 light:bg-slate-100 text-xs border border-slate-700 light:border-slate-200">
                Suasana: {(note as any).mood}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white light:text-[#12202C] font-display tracking-tight leading-[1.15]">
            {note.title}
          </h1>

          <div className="flex items-center gap-3 text-xs text-slate-400 light:text-slate-600 font-medium pt-1">
            {note.author && (
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-cyan-400 light:text-blue-600" />
                <span>Ditulis oleh: <strong className="text-slate-200 light:text-slate-900">{note.author.name}</strong></span>
              </div>
            )}
          </div>
        </header>

        {/* Article Summary Box */}
        {note.summary && (
          <div className="p-5 sm:p-6 rounded-2xl bg-cyan-950/30 light:bg-[#EEF4F8] border border-cyan-500/20 light:border-[#DCE7EE] text-slate-200 light:text-[#12202C] text-sm sm:text-base leading-relaxed italic shadow-sm">
            <p className="not-italic font-bold text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-[#087EDB] mb-2">
              // Ringkasan Pembahasan Hari Ini
            </p>
            &ldquo;{note.summary}&rdquo;
          </div>
        )}

        {/* Important Points Section */}
        {note.importantPoints && (
          <section className="card p-6 bg-[#08152e]/70 light:bg-white border-cyan-500/20 light:border-[#DCE7EE] shadow-sm space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 light:text-[#087EDB] flex items-center gap-2">
              <Lightbulb size={15} />
              <span>Poin-Poin Penting Pembelajaran</span>
            </h2>
            <div className="text-sm text-slate-200 light:text-[#405463] leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-cyan-400 light:border-[#087EDB]">
              {note.importantPoints}
            </div>
          </section>
        )}

        {/* Main Content (Rich academic article body) */}
        <section className="prose prose-invert light:prose-slate max-w-none space-y-4">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#08152e]/60 light:bg-white border border-cyan-500/15 light:border-[#DCE7EE] shadow-sm">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 light:text-[#087EDB] mb-4">
              // Catatan Lengkap Perkuliahan
            </h2>
            <div className="text-sm sm:text-base text-slate-200 light:text-[#12202C] leading-relaxed whitespace-pre-wrap font-sans">
              {note.content}
            </div>
          </div>
        </section>

        {/* Next Steps / Tindak Lanjut */}
        {note.nextSteps && (
          <section className="card p-6 bg-teal-950/20 light:bg-emerald-50/50 border-teal-500/20 light:border-emerald-200 space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 light:text-emerald-700 flex items-center gap-2">
              <ListOrdered size={15} />
              <span>Langkah Selanjutnya &bull; Next Steps</span>
            </h2>
            <div className="text-sm text-slate-200 light:text-[#12202C] leading-relaxed whitespace-pre-wrap">
              {note.nextSteps}
            </div>
          </section>
        )}

        {/* Connected Materials & Tasks */}
        {((note.materials && note.materials.length > 0) || (note.tasks && note.tasks.length > 0)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-cyan-500/15 light:border-[#DCE7EE]">
            {note.materials && note.materials.length > 0 && (
              <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-[#DCE7EE] space-y-2.5">
                <h3 className="text-xs font-bold text-white light:text-[#12202C] flex items-center gap-2">
                  <BookMarked size={14} className="text-purple-400" />
                  <span>Materi Pembelajaran Terkait</span>
                </h3>
                <div className="space-y-2">
                  {note.materials.map(({ material }: any) => (
                    <Link
                      key={material.id}
                      href={`/materials/${material.id}`}
                      className="block p-2.5 rounded-lg bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 hover:border-cyan-400/40 text-xs"
                    >
                      <div className="font-bold text-white light:text-[#12202C]">{material.title}</div>
                      <div className="text-[10px] text-purple-300 light:text-purple-700 font-mono mt-0.5">{material.type}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {note.tasks && note.tasks.length > 0 && (
              <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-[#DCE7EE] space-y-2.5">
                <h3 className="text-xs font-bold text-white light:text-[#12202C] flex items-center gap-2">
                  <CheckSquare size={14} className="text-teal-400" />
                  <span>Tugas / Penugasan Terkait</span>
                </h3>
                <div className="space-y-2">
                  {note.tasks.map(({ task }: any) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block p-2.5 rounded-lg bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 hover:border-cyan-400/40 text-xs"
                    >
                      <div className="font-bold text-white light:text-[#12202C]">{task.title}</div>
                      <div className="text-[10px] text-teal-300 light:text-teal-700 font-mono mt-0.5">
                        Tenggat: {formatDate(task.deadline)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {note.tags && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-400 light:text-slate-500 font-mono flex items-center gap-1">
              <Tag size={12} /> Topik:
            </span>
            {note.tags.split(",").map((t: string) => (
              <span
                key={t.trim()}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 light:bg-[#EEF4F8] text-cyan-300 light:text-[#087EDB] text-xs font-mono border border-cyan-500/20 light:border-[#DCE7EE]"
              >
                #{t.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Previous / Next Note Navigation */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-cyan-500/20 light:border-[#DCE7EE]">
          {prevNote ? (
            <Link
              href={`/daily-notes/${prevNote.id}`}
              className="p-4 rounded-xl bg-[#08152e]/80 light:bg-white border border-cyan-500/20 light:border-[#DCE7EE] hover:border-cyan-400/40 light:hover:border-[#087EDB] transition-colors group block"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-400 light:text-slate-500 font-mono mb-1">
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span>Catatan Sebelumnya</span>
              </div>
              <div className="font-bold text-white light:text-[#12202C] text-sm group-hover:text-cyan-300 light:group-hover:text-[#087EDB] transition-colors truncate">
                {prevNote.title}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{formatDate(prevNote.date)}</div>
            </Link>
          ) : (
            <div />
          )}

          {nextNote ? (
            <Link
              href={`/daily-notes/${nextNote.id}`}
              className="p-4 rounded-xl bg-[#08152e]/80 light:bg-white border border-cyan-500/20 light:border-[#DCE7EE] hover:border-cyan-400/40 light:hover:border-[#087EDB] transition-colors group block text-right"
            >
              <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400 light:text-slate-500 font-mono mb-1">
                <span>Catatan Berikutnya</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="font-bold text-white light:text-[#12202C] text-sm group-hover:text-cyan-300 light:group-hover:text-[#087EDB] transition-colors truncate">
                {nextNote.title}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{formatDate(nextNote.date)}</div>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </div>
  );
}
