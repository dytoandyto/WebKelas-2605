"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Globe,
  Archive,
  Eye,
  EyeOff,
  Sparkles,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
} from "lucide-react";
import { generateSlug, calculateReadingTime } from "@/lib/utils";
import { createArticleAction, updateArticleAction } from "@/lib/actions/articles";
import { ArticleContentRenderer } from "@/components/learning/article-content-renderer";
import { ArticleStatus } from "@prisma/client";

interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

interface ArticleEditorProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    coverImage?: string | null;
    status: ArticleStatus;
    tags?: string | null;
    isFeatured?: boolean;
    featured?: boolean;
    subjectId?: string | null;
  };
  subjects: SubjectOption[];
  isEdit?: boolean;
}

export function ArticleEditor({ initialData, subjects, isEdit = false }: ArticleEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || "");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [status, setStatus] = useState<ArticleStatus>(initialData?.status || "DRAFT");
  const [featured, setFeatured] = useState(initialData?.isFeatured ?? initialData?.featured ?? false);

  // Editor View Mode: "edit" | "preview" | "split"
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-generate slug when title changes unless slug was manually edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(e.target.value));
  };

  // Helper to insert markdown tokens at cursor
  const insertToken = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = document.getElementById("article-content-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Save handler
  const handleSave = (targetStatus?: ArticleStatus) => {
    const finalStatus = targetStatus || status;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage("Judul artikel wajib diisi.");
      return;
    }
    if (!content.trim()) {
      setErrorMessage("Konten isi artikel tidak boleh kosong.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: title.trim(),
          slug: slug.trim() || generateSlug(title),
          excerpt: excerpt.trim() || undefined,
          content: content.trim(),
          coverImage: coverImage.trim() || undefined,
          subjectId: subjectId || undefined,
          tags: tags.trim() || undefined,
          status: finalStatus,
          isFeatured: featured,
          readingTime,
          resourceIds: [],
          noteIds: [],
        };

        if (isEdit && initialData?.id) {
          const res = await updateArticleAction(initialData.id, payload);
          if (res.error) {
            setErrorMessage(res.error);
          } else {
            setSuccessMessage("Artikel berhasil diperbarui!");
            setStatus(finalStatus);
            router.refresh();
          }
        } else {
          const res = await createArticleAction(payload);
          if (res.error) {
            setErrorMessage(res.error);
          } else {
            setSuccessMessage("Artikel berhasil dibuat!");
            router.push(`/admin/articles`);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan artikel.");
      }
    });
  };

  const readingTime = calculateReadingTime(content);

  return (
    <div className="space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {isEdit ? "Edit Artikel Edukasi" : "Tulis Artikel Baru"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Status: <span className="font-bold uppercase text-blue-600 dark:text-cyan-400">{status}</span> &bull; {readingTime} min read
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Public Link if edit and published */}
          {isEdit && slug && (
            <Link
              href={`/learning/articles/${slug}`}
              target="_blank"
              className="btn btn-secondary btn-sm text-xs font-mono"
            >
              <Eye size={13} />
              <span>Lihat Publik</span>
            </Link>
          )}

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave("DRAFT")}
            className="btn btn-secondary btn-sm text-xs font-mono cursor-pointer"
          >
            <Save size={13} />
            <span>Simpan Draft</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave("PUBLISHED")}
            className="btn btn-primary btn-sm text-xs font-mono cursor-pointer"
          >
            <Globe size={13} />
            <span>{status === "PUBLISHED" ? "Perbarui Publikasi" : "Publikasikan"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Editor, 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="card p-6 bg-white dark:bg-[#0c1427] border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono mb-1.5">
                Judul Artikel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Contoh: Pengantar Pemrograman Berorientasi Objek dengan C#"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white font-semibold text-base focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono mb-1.5">
                Slug URL <span className="text-slate-400 font-normal">(tergenerate otomatis)</span>
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 overflow-hidden font-mono text-xs">
                <span className="px-3 py-2 text-slate-400 border-r border-slate-300 dark:border-slate-700 select-none">
                  /articles/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="pengantar-oop-csharp"
                  className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono mb-1.5">
                Ringkasan / Excerpt
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan singkat bahasan artikel untuk cuplikan kartu katalog..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-colors leading-relaxed"
              />
            </div>
          </div>

          {/* Article Body & Markdown Toolbar */}
          <div className="card p-6 bg-white dark:bg-[#0c1427] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileText size={14} className="text-blue-500 dark:text-cyan-400" />
                <span>Konten Pembelajaran (Markdown)</span>
              </label>

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-900 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    viewMode === "edit"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 font-bold shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    viewMode === "preview"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 font-bold shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Pratinjau
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("split")}
                  className={`hidden md:block px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    viewMode === "split"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 font-bold shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Berdampingan
                </button>
              </div>
            </div>

            {/* Markdown Toolbar */}
            {viewMode !== "preview" && (
              <div className="flex flex-wrap items-center gap-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                <button
                  type="button"
                  title="Heading 2"
                  onClick={() => insertToken("## ", "\n", "Judul Bagian")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Heading2 size={15} />
                </button>
                <button
                  type="button"
                  title="Heading 3"
                  onClick={() => insertToken("### ", "\n", "Sub-judul Bagian")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Heading3 size={15} />
                </button>
                <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  title="Tebal (Bold)"
                  onClick={() => insertToken("**", "**", "teks tebal")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  title="Miring (Italic)"
                  onClick={() => insertToken("*", "*", "teks miring")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  title="Coret (Strikethrough)"
                  onClick={() => insertToken("~~", "~~", "teks coret")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Strikethrough size={15} />
                </button>
                <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  title="Kode Baris"
                  onClick={() => insertToken("`", "`", "variableName")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Code size={15} />
                </button>
                <button
                  type="button"
                  title="Blok Kode Program"
                  onClick={() => insertToken("```csharp\n", "\n```\n", "// tulis kode di sini")}
                  className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-mono text-[10px] cursor-pointer"
                >
                  &lt;/&gt; Blok
                </button>
                <button
                  type="button"
                  title="Kutipan"
                  onClick={() => insertToken("> ", "\n", "Kutipan atau poin penting")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Quote size={15} />
                </button>
                <button
                  type="button"
                  title="Callout Box"
                  onClick={() => insertToken("> [!NOTE]\n> ", "\n", "Pesan informasi penting")}
                  className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-mono text-[10px] cursor-pointer"
                >
                  [!NOTE]
                </button>
                <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  title="Daftar Poin"
                  onClick={() => insertToken("- ", "\n", "Poin materi")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  title="Daftar Angka"
                  onClick={() => insertToken("1. ", "\n", "Langkah pertama")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ListOrdered size={15} />
                </button>
                <button
                  type="button"
                  title="Tabel Markdown"
                  onClick={() =>
                    insertToken(
                      "\n| Konsep | Penjelasan | Contoh |\n| --- | --- | --- |\n| Term | Deskripsi | Misal |\n\n"
                    )
                  }
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <TableIcon size={15} />
                </button>
                <button
                  type="button"
                  title="Tautan Link"
                  onClick={() => insertToken("[", "](https://example.com)", "Nama Tautan")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <LinkIcon size={15} />
                </button>
                <button
                  type="button"
                  title="Gambar"
                  onClick={() => insertToken("![", "](https://example.com/image.jpg)", "Deskripsi Gambar")}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ImageIcon size={15} />
                </button>
              </div>
            )}

            {/* Split / Edit / Preview Views */}
            <div
              className={`grid gap-4 ${
                viewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {/* Textarea Editor */}
              {viewMode !== "preview" && (
                <div>
                  <textarea
                    id="article-content-textarea"
                    rows={22}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tulis artikel pembelajaran di sini menggunakan Markdown..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-colors"
                  />
                </div>
              )}

              {/* Live Preview Screen */}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 max-h-[580px] overflow-y-auto">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Pratinjau Pembacaan Publik
                  </div>
                  <ArticleContentRenderer content={content} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Metadata, Subject, Cover, 1 Col) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="card p-6 bg-white dark:bg-[#0c1427] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono pb-2 border-b border-slate-200 dark:border-slate-800">
              Pengaturan Artikel
            </h3>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
                Status Publikasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
              >
                <option value="DRAFT">DRAFT (Pribadi/Draf)</option>
                <option value="PUBLISHED">PUBLISHED (Diterbitkan ke Publik)</option>
                <option value="ARCHIVED">ARCHIVED (Diarsipkan)</option>
              </select>
            </div>

            {/* Subject Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
                Mata Kuliah
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
              >
                <option value="">-- Pilih Mata Kuliah (Opsional) --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
                Topik / Tag <span className="text-slate-400 font-normal">(pisahkan koma)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="csharp, alpro, oop, logika"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
                URL Gambar Sampul
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
              />
              {coverImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 aspect-[16/9] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="Preview sampul"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Featured Article Toggle */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Sorot di Beranda Hub
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Tampilkan sebagai artikel unggulan
                </span>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Tips Card */}
          <div className="card p-5 bg-blue-500/5 dark:bg-cyan-500/5 border-blue-500/20 dark:border-cyan-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-cyan-400 font-mono">
              <Sparkles size={14} />
              <span>Format Edukatif Pedagosis</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Gunakan heading <code className="font-mono bg-blue-500/10 dark:bg-cyan-500/10 px-1 rounded">##</code> untuk membagi topik ke daftar isi otomatis. Sertakan blok kode dengan nama bahasa (misal <code className="font-mono bg-blue-500/10 dark:bg-cyan-500/10 px-1 rounded">```csharp</code>) agar sintaks tersorot rapi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
