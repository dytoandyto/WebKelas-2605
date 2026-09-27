"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  X,
  Calendar,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  createDailyNoteAction,
  updateDailyNoteAction,
  deleteDailyNoteAction,
} from "@/lib/actions/daily-notes";

interface DailyNoteItem {
  id: string;
  date: string | Date;
  title: string;
  summary: string;
  content: string;
  importantPoints?: string | null;
  nextSteps?: string | null;
  mood?: string | null;
  tags?: string | null;
  subjectId?: string | null;
  updatedAt: string | Date;
  subject?: {
    id: string;
    code: string;
    name: string;
  } | null;
  author?: {
    id: string;
    name: string;
  } | null;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
}

interface DailyNotesManagerProps {
  initialNotes: DailyNoteItem[];
  subjects: SubjectItem[];
}

export function DailyNotesManager({ initialNotes, subjects }: DailyNotesManagerProps) {
  const [notes, setNotes] = useState<DailyNoteItem[]>(initialNotes);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNoteItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [formDate, setFormDate] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImportantPoints, setFormImportantPoints] = useState("");
  const [formNextSteps, setFormNextSteps] = useState("");
  const [formMood, setFormMood] = useState("");
  const [formTags, setFormTags] = useState("");

  const filtered = notes.filter((n) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchSummary = n.summary.toLowerCase().includes(q);
      const matchSubject = n.subject?.name.toLowerCase().includes(q) || n.subject?.code.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchSubject) return false;
    }
    if (subjectFilter !== "ALL" && n.subjectId !== subjectFilter) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingNote(null);
    const today = new Date().toISOString().split("T")[0];
    setFormDate(today);
    setFormTitle("");
    setFormSubjectId(subjects[0]?.id || "");
    setFormSummary("");
    setFormContent("");
    setFormImportantPoints("");
    setFormNextSteps("");
    setFormMood("⚡ Produktif");
    setFormTags("");
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (note: DailyNoteItem) => {
    setEditingNote(note);
    const d = new Date(note.date).toISOString().split("T")[0];
    setFormDate(d);
    setFormTitle(note.title);
    setFormSubjectId(note.subjectId || "");
    setFormSummary(note.summary);
    setFormContent(note.content);
    setFormImportantPoints(note.importantPoints || "");
    setFormNextSteps(note.nextSteps || "");
    setFormMood(note.mood || "");
    setFormTags(note.tags || "");
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const payload = {
      date: new Date(formDate).toISOString(),
      title: formTitle,
      summary: formSummary || null,
      content: formContent,
      subjectId: formSubjectId || null,
      importantPoints: formImportantPoints || null,
      nextSteps: formNextSteps || null,
      tags: formTags || null,
      materialIds: [],
      taskIds: [],
    };

    try {
      if (editingNote) {
        const res = await updateDailyNoteAction(editingNote.id, payload);
        if (!res.success) {
          setErrorMessage(res.error || "Gagal memperbarui catatan");
          setLoading(false);
          return;
        }
        const targetSubject = subjects.find((s) => s.id === formSubjectId);
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNote.id
              ? {
                  ...n,
                  date: new Date(formDate),
                  title: formTitle,
                  summary: formSummary,
                  content: formContent,
                  subjectId: formSubjectId || null,
                  importantPoints: formImportantPoints,
                  nextSteps: formNextSteps,
                  mood: formMood,
                  tags: formTags,
                  updatedAt: new Date(),
                  subject: targetSubject ? { ...targetSubject } : null,
                }
              : n
          )
        );
      } else {
        const res = await createDailyNoteAction(payload);
        if (!res.success) {
          setErrorMessage(res.error || "Gagal membuat catatan");
          setLoading(false);
          return;
        }
        const targetSubject = subjects.find((s) => s.id === formSubjectId);
        const newRecord: DailyNoteItem = {
          id: (res as any).data?.id || `note-${Date.now()}`,
          date: new Date(formDate),
          title: formTitle,
          summary: formSummary,
          content: formContent,
          subjectId: formSubjectId || null,
          importantPoints: formImportantPoints,
          nextSteps: formNextSteps,
          mood: formMood,
          tags: formTags,
          updatedAt: new Date(),
          subject: targetSubject ? { ...targetSubject } : null,
          author: { id: "admin", name: "Admin" },
        };
        setNotes((prev) => [newRecord, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await deleteDailyNoteAction(deletingId);
      if (res.success) {
        setNotes((prev) => prev.filter((n) => n.id !== deletingId));
        setDeleteDialogOpen(false);
        setDeletingId(null);
      } else {
        alert(res.error || "Gagal menghapus catatan");
      }
    } catch (err: any) {
      alert(err.message || "Gagal menghapus catatan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 light:text-blue-600 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari catatan perkuliahan, topik, ringkasan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#040813]/80 light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-xs sm:text-sm text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#040813]/80 light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-300 light:text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Mata Kuliah</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>

            <button
              onClick={openCreateModal}
              className="btn btn-primary btn-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Tulis Catatan Harian</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Notes Table */}
      <div className="rounded-2xl bg-[#08152e]/85 light:bg-white border border-cyan-500/25 light:border-slate-200 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 light:border-slate-200 bg-[#040914]/80 light:bg-slate-50 text-cyan-300 light:text-blue-700 font-mono uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">Tanggal</th>
                <th className="py-3.5 px-4 font-bold">Judul &amp; Ringkasan</th>
                <th className="py-3.5 px-4 font-bold">Mata Kuliah</th>
                <th className="py-3.5 px-4 font-bold">Penulis</th>
                <th className="py-3.5 px-4 font-bold">Terakhir Diubah</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10 light:divide-slate-100">
              {filtered.map((note) => (
                <tr
                  key={note.id}
                  className="hover:bg-cyan-500/5 light:hover:bg-blue-50/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300 light:text-blue-700 whitespace-nowrap">
                    {formatDate(note.date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white light:text-slate-900 text-sm">{note.title}</div>
                    <div className="text-[11px] text-slate-400 light:text-slate-600 line-clamp-1 mt-0.5">
                      {note.summary}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {note.subject ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/15 light:bg-blue-50 text-cyan-300 light:text-blue-700 font-mono font-bold text-[10px] border border-cyan-400/30 light:border-blue-200">
                        {note.subject.code}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300 light:text-slate-700">
                    {note.author?.name || "Admin"}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 light:text-slate-500 text-[11px]">
                    {formatDate(note.updatedAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/daily-notes/${note.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-cyan-500/10 light:bg-blue-50 text-cyan-400 light:text-blue-600 hover:bg-cyan-500/20"
                        title="Buka Catatan"
                      >
                        <ExternalLink size={13} />
                      </Link>
                      <button
                        onClick={() => openEditModal(note)}
                        className="p-1.5 rounded-lg bg-white/5 light:bg-slate-100 text-slate-300 light:text-slate-700 hover:text-white hover:bg-cyan-500/20"
                        title="Edit Catatan"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(note.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        title="Hapus Catatan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 light:text-slate-600">
              Tidak ada catatan harian yang sesuai.
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal (Structured Note Editor) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#08152e] light:bg-white border border-cyan-500/30 light:border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 light:border-slate-200">
              <h3 className="font-bold text-base text-white light:text-slate-900 font-display">
                {editingNote ? "Edit Jurnal Harian Kuliah" : "Tulis Jurnal Harian Kuliah Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                    Tanggal Pembelajaran <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                    Mata Kuliah
                  </label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                  >
                    <option value="">Pilih Mata Kuliah</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                    Suasana Kelas (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formMood}
                    onChange={(e) => setFormMood(e.target.value)}
                    placeholder="Contoh: 💡 Antusias, ⚡ Fokus"
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Judul Catatan / Topik Pembelajaran <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Pengenalan Dasar Algoritma & Flowchart Pemrograman"
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Ringkasan Eksekutif (Summary) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Hari ini membahas konsep algoritma sekuensial, percabangan if-else, dan studi kasus praktis..."
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Poin-Poin Penting (Important Points)
                </label>
                <textarea
                  rows={3}
                  value={formImportantPoints}
                  onChange={(e) => setFormImportantPoints(e.target.value)}
                  placeholder="- Definisi Algoritma menurut Knuth&#10;- Simbol flowchart standar ANSI&#10;- Aturan penamaan identifier dalam kode"
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Catatan Lengkap Pembelajaran <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tuliskan catatan detail perkuliahan hari ini..."
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                    Langkah Selanjutnya / Tindak Lanjut
                  </label>
                  <input
                    type="text"
                    value={formNextSteps}
                    onChange={(e) => setFormNextSteps(e.target.value)}
                    placeholder="Review modul bab 2 & kerjakan tugas 01"
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                    Tag / Topik (Pisahkan koma)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="algoritma, flowchart, bab1"
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 light:border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-sm"
                >
                  {loading ? "Menyimpan..." : editingNote ? "Simpan Perubahan" : "Terbitkan Catatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#08152e] light:bg-white border border-rose-500/30 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-base text-white light:text-slate-900">
                Konfirmasi Hapus Catatan
              </h3>
            </div>
            <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan harian ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingId(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {loading ? "Menghapus..." : "Ya, Hapus Catatan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
