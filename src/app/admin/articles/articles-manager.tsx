"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  Globe,
  Archive,
  Save,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn, formatDate, calculateReadingTime } from "@/lib/utils";
import {
  togglePublishArticleAction,
  archiveArticleAction,
  deleteArticleAction,
} from "@/lib/actions/articles";
import { EmptyState } from "@/components/ui/empty-state";
import { ArticleStatus } from "@prisma/client";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  status: ArticleStatus;
  featured: boolean;
  tags?: string | null;
  publishedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  subject?: {
    id: string;
    code: string;
    name: string;
  } | null;
  author?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
}

interface ArticlesManagerProps {
  initialArticles: ArticleItem[];
  subjects: SubjectItem[];
}

export function ArticlesManager({ initialArticles, subjects }: ArticlesManagerProps) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ArticleStatus>("ALL");

  // Delete Dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter logic
  const filtered = articles.filter((a) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchSlug = a.slug.toLowerCase().includes(q);
      const matchSubject = a.subject?.name.toLowerCase().includes(q) || a.subject?.code.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchSubject) return false;
    }
    if (subjectFilter !== "ALL" && a.subject?.id !== subjectFilter) return false;
    if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
    return true;
  });

  const handleToggleStatus = (id: string, currentStatus: ArticleStatus) => {
    startTransition(async () => {
      setActionMessage(null);
      try {
        const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
        const res = await togglePublishArticleAction(id);
        if (!res.success) {
          setActionMessage({ type: "error", text: res.error || "Gagal mengubah status." });
        } else {
          setArticles((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
          );
          setActionMessage({
            type: "success",
            text: `Artikel berhasil diubah statusnya menjadi ${nextStatus}.`,
          });
        }
      } catch (err: any) {
        setActionMessage({ type: "error", text: err.message || "Gagal mengubah status artikel." });
      }
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      setActionMessage(null);
      try {
        const res = await archiveArticleAction(id);
        if (res.error) {
          setActionMessage({ type: "error", text: res.error });
        } else {
          setArticles((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status: "ARCHIVED" as ArticleStatus } : item))
          );
          setActionMessage({ type: "success", text: "Artikel berhasil diarsipkan." });
        }
      } catch (err: any) {
        setActionMessage({ type: "error", text: err.message || "Gagal mengarsipkan artikel." });
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setActionMessage(null);
    try {
      const res = await deleteArticleAction(deleteId);
      if (res.error) {
        setActionMessage({ type: "error", text: res.error });
      } else {
        setArticles((prev) => prev.filter((item) => item.id !== deleteId));
        setActionMessage({ type: "success", text: "Artikel berhasil dihapus." });
        setDeleteId(null);
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Gagal menghapus artikel." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Daftar Artikel Edukasi ({articles.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publikasikan materi terstruktur, tutorial pemrograman, dan wawasan akademik untuk mahasiswa.
          </p>
        </div>

        <Link
          href="/admin/articles/create"
          className="btn btn-primary btn-sm flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs"
        >
          <Plus size={14} />
          <span>Tulis Artikel Baru</span>
        </Link>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-500"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 size={15} className="shrink-0" />
          ) : (
            <AlertCircle size={15} className="shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card p-4 bg-white dark:bg-[#0c1427] border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul artikel, topik, atau mata kuliah..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="PUBLISHED">Published (Publik)</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived (Arsip)</option>
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Semua Mata Kuliah</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title="Tidak Ada Artikel Ditemukan"
          description={
            search || subjectFilter !== "ALL" || statusFilter !== "ALL"
              ? "Coba sesuaikan kata kunci pencarian atau filter status."
              : "Belum ada artikel edukasi. Mulai buat artikel pertama untuk mahasiswa!"
          }
        />
      ) : (
        <div className="card overflow-hidden bg-white dark:bg-[#0c1427] border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 font-bold">Judul Artikel</th>
                  <th className="px-4 py-3.5 font-bold">Mata Kuliah</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-4 py-3.5 font-bold">Penulis</th>
                  <th className="px-4 py-3.5 font-bold">Waktu Baca</th>
                  <th className="px-4 py-3.5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => {
                  const readingTime = calculateReadingTime(item.content);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Title & Slug */}
                      <td className="px-4 py-4 min-w-[240px]">
                        <div className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 flex items-center gap-1.5">
                          {item.featured && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              Unggulan
                            </span>
                          )}
                          <span>{item.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          /articles/{item.slug}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {item.subject ? (
                          <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 font-mono text-[11px] font-bold border border-blue-200 dark:border-cyan-500/20">
                            {item.subject.code}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            item.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : item.status === "DRAFT"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="font-medium text-xs">
                          {item.author?.name || "Tim Akademik"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.author?.role?.replace("_", " ") || "-"}
                        </div>
                      </td>

                      {/* Reading Time */}
                      <td className="px-4 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                        {readingTime} menit
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Public View link */}
                          <Link
                            href={`/articles/${item.slug}`}
                            target="_blank"
                            title="Pratinjau Halaman Publik"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <ExternalLink size={13} />
                          </Link>

                          {/* Quick Publish / Unpublish Toggle */}
                          <button
                            type="button"
                            title={item.status === "PUBLISHED" ? "Tarik ke Draft" : "Publikasikan"}
                            disabled={isPending}
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Globe size={13} />
                          </button>

                          {/* Archive toggle */}
                          {item.status !== "ARCHIVED" && (
                            <button
                              type="button"
                              title="Arsipkan Artikel"
                              disabled={isPending}
                              onClick={() => handleArchive(item.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Archive size={13} />
                            </button>
                          )}

                          {/* Edit Page */}
                          <Link
                            href={`/admin/articles/${item.id}/edit`}
                            title="Edit Artikel"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 size={13} />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            title="Hapus Artikel"
                            onClick={() => setDeleteId(item.id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          onClick={() => setDeleteId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-xl bg-rose-500/10">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                Konfirmasi Hapus Artikel
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini akan menghapus artikel dari Learning Hub publik secara permanen.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="btn btn-secondary btn-sm text-xs font-mono cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="btn btn-danger btn-sm text-xs font-mono cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Artikel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
