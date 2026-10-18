"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

import {
  ArrowLeft,
  Save,
  Globe,
  Archive,
  Eye,
  FileText,
  Sparkles,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RemoveFormatting,
  Heading1,
  Heading2,
  Heading3,
  Columns2,
  Maximize2,
  SidebarClose,
  SidebarOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Upload,
  X,
  ExternalLink,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

import { cn, generateSlug, calculateReadingTime } from "@/lib/utils";
import { createArticleAction, updateArticleAction, uploadArticleImageAction } from "@/lib/actions/articles";
import { ArticleContentRenderer } from "@/components/learning/article-content-renderer";
import { isHtmlContent, markdownToHtml } from "@/lib/editor/content-converter";
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
    updatedAt?: Date | string;
    createdAt?: Date | string;
  };
  subjects: SubjectOption[];
  isEdit?: boolean;
}

export function ArticleEditor({ initialData, subjects, isEdit = false }: ArticleEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  // Document metadata state
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [slug, setSlug] = React.useState(initialData?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(Boolean(initialData?.slug));
  const [excerpt, setExcerpt] = React.useState(initialData?.excerpt || "");
  const [coverImage, setCoverImage] = React.useState(initialData?.coverImage || "");
  const [subjectId, setSubjectId] = React.useState(initialData?.subjectId || "");
  const [tags, setTags] = React.useState(initialData?.tags || "");
  const [status, setStatus] = React.useState<ArticleStatus>(initialData?.status || ArticleStatus.DRAFT);
  const [isFeatured, setIsFeatured] = React.useState(initialData?.isFeatured ?? initialData?.featured ?? false);

  // Content string for save payload & preview
  const [content, setContent] = React.useState(initialData?.content || "");

  // UI state
  const [viewMode, setViewMode] = React.useState<"edit" | "preview" | "split">("edit");
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"clean" | "dirty" | "saving" | "saved" | "error">("clean");
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  // Modals state
  const [isLinkModalOpen, setIsLinkModalOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkText, setLinkText] = React.useState("");

  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageAlt, setImageAlt] = React.useState("");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [imageUploadTab, setImageUploadTab] = React.useState<"upload" | "url">("upload");

  // Local draft recovery notification
  const [recoveredDraft, setRecoveredDraft] = React.useState<any | null>(null);

  // Storage key for local recovery
  const localDraftKey = React.useMemo(() => {
    return `classhub_draft_article_${initialData?.id || "new"}`;
  }, [initialData?.id]);

  // Initial HTML parsing (convert markdown if legacy)
  const initialHtml = React.useMemo(() => {
    const raw = initialData?.content || "";
    if (!raw.trim()) return "<p></p>";
    return isHtmlContent(raw) ? raw : markdownToHtml(raw);
  }, [initialData?.content]);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        undoRedo: {
          depth: 100,
          newGroupDelay: 400,
        },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-cyan-600 dark:text-cyan-400 underline font-medium cursor-pointer",
        },
      }),
      ImageExtension.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-xl max-w-full my-6 border border-slate-200 dark:border-slate-800 shadow-sm",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Mulai menulis artikel atau tekan '/' untuk panduan penulisan...",
      }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-[520px] text-base leading-relaxed text-slate-800 dark:text-slate-200",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      setIsDirty(true);
      setSaveStatus("dirty");
    },
  });

  // Track slug generation
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsDirty(true);
    setSaveStatus("dirty");
    if (!slugManuallyEdited) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(newSlug));
    setIsDirty(true);
    setSaveStatus("dirty");
  };

  // 1. Check for unsaved local draft on initial load
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(localDraftKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const serverUpdatedAt = initialData?.updatedAt ? new Date(initialData.updatedAt).getTime() : 0;
        if (parsed.savedAt && parsed.savedAt > serverUpdatedAt && parsed.content && parsed.content !== initialData?.content) {
          setRecoveredDraft(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [localDraftKey, initialData]);

  // 2. Debounced local draft autosave (saves to localStorage every 3 seconds of typing)
  React.useEffect(() => {
    if (!isDirty || typeof window === "undefined") return;

    const timer = setTimeout(() => {
      try {
        const payload = {
          title,
          slug,
          excerpt,
          content,
          tags,
          subjectId,
          coverImage,
          savedAt: Date.now(),
        };
        localStorage.setItem(localDraftKey, JSON.stringify(payload));
      } catch {
        // Storage quota full or unavailable
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isDirty, title, slug, excerpt, content, tags, subjectId, coverImage, localDraftKey]);

  // 3. BeforeUnload warning for unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Restore recovered draft
  const handleApplyRecoveredDraft = () => {
    if (!recoveredDraft) return;
    if (recoveredDraft.title) setTitle(recoveredDraft.title);
    if (recoveredDraft.slug) setSlug(recoveredDraft.slug);
    if (recoveredDraft.excerpt) setExcerpt(recoveredDraft.excerpt);
    if (recoveredDraft.tags) setTags(recoveredDraft.tags);
    if (recoveredDraft.subjectId) setSubjectId(recoveredDraft.subjectId);
    if (recoveredDraft.coverImage) setCoverImage(recoveredDraft.coverImage);

    if (recoveredDraft.content && editor) {
      editor.commands.setContent(recoveredDraft.content);
      setContent(recoveredDraft.content);
    }
    setRecoveredDraft(null);
    setIsDirty(true);
    setSaveStatus("dirty");
    setStatusMessage("Draf lokal berhasil dipulihkan.");
  };

  const handleDiscardRecoveredDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(localDraftKey);
    }
    setRecoveredDraft(null);
  };

  // Word & Reading Time stats
  const stats = React.useMemo(() => {
    const text = editor ? editor.getText() : content.replace(/<[^>]+>/g, " ");
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingMinutes = Math.min(120, Math.max(1, Math.ceil(words / 190)));
    return { words, chars, readingMinutes };
  }, [editor, content]);

  // Save handler (Draft or Publish)
  const handleSave = (targetStatus?: ArticleStatus) => {
    const finalStatus = targetStatus || status;
    setStatusMessage(null);

    if (!title.trim()) {
      setStatusMessage("Judul artikel wajib diisi.");
      setSaveStatus("error");
      return;
    }

    const currentHtml = editor ? editor.getHTML() : content;
    const plainText = editor ? editor.getText() : currentHtml.replace(/<[^>]+>/g, "").trim();

    if (!plainText.trim()) {
      setStatusMessage("Konten artikel tidak boleh kosong.");
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");

    startTransition(async () => {
      try {
        const payload = {
          title: title.trim(),
          slug: slug.trim() || generateSlug(title),
          excerpt: excerpt.trim() || undefined,
          content: currentHtml,
          coverImage: coverImage.trim() || undefined,
          subjectId: subjectId || undefined,
          tags: tags.trim() || undefined,
          status: finalStatus,
          isFeatured,
          readingTime: stats.readingMinutes,
          resourceIds: [],
          noteIds: [],
        };

        if (isEdit && initialData?.id) {
          const res = await updateArticleAction(initialData.id, payload);
          if (res.error) {
            setSaveStatus("error");
            setStatusMessage(res.error);
          } else {
            setSaveStatus("saved");
            setIsDirty(false);
            setStatus(finalStatus);
            setStatusMessage("Semua perubahan tersimpan ke server.");
            if (typeof window !== "undefined") {
              localStorage.removeItem(localDraftKey);
            }
            router.refresh();
          }
        } else {
          const res = await createArticleAction(payload);
          if (res.error) {
            setSaveStatus("error");
            setStatusMessage(res.error);
          } else {
            setSaveStatus("saved");
            setIsDirty(false);
            if (typeof window !== "undefined") {
              localStorage.removeItem(localDraftKey);
            }
            setStatusMessage("Artikel berhasil dibuat!");
            router.push(`/admin/articles`);
          }
        }
      } catch (err: any) {
        setSaveStatus("error");
        setStatusMessage(err.message || "Terjadi kesalahan saat menyimpan artikel.");
      }
    });
  };

  // Link Dialog submission
  const handleApplyLink = () => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith("/")) {
        finalUrl = `https://${finalUrl}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalUrl, target: "_blank" })
        .run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl("");
    setLinkText("");
  };

  const openLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    const selection = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    setLinkUrl(previousUrl);
    setLinkText(selection);
    setIsLinkModalOpen(true);
  };

  // Image Upload & Insertion
  const handleInsertImageUrl = () => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || title }).run();
    setIsImageModalOpen(false);
    setImageUrl("");
    setImageAlt("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran berkas gambar maksimal 5MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadArticleImageAction(formData);
      if (res.success && res.data?.url && editor) {
        editor.chain().focus().setImage({ src: res.data.url, alt: imageAlt.trim() || file.name }).run();
        setIsImageModalOpen(false);
        setImageUrl("");
        setImageAlt("");
      } else {
        alert(res.error || "Gagal mengunggah berkas gambar.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat mengunggah gambar.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col bg-slate-100/60 dark:bg-[#070d19]">
      {/* 1. TOP STICKY APPLICATION HEADER (Gutenberg / Word style) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1427]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Navigation and Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/articles"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Kembali ke Kelola Artikel"
            >
              <ArrowLeft size={16} />
            </Link>

            <div className="min-w-0 flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-400 hidden sm:inline">
                Artikel /
              </span>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {title.trim() || (isEdit ? "Edit Artikel" : "Artikel Baru")}
              </h1>
            </div>

            {/* Status Pill Badge */}
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 border",
                status === "PUBLISHED"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : status === "DRAFT"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30"
              )}
            >
              {status}
            </span>
          </div>

          {/* Center: Live Save Status Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400">
                <Loader2 size={13} className="animate-spin" />
                <span>Menyimpan perubahan...</span>
              </span>
            ) : saveStatus === "saved" ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={13} />
                <span>Semua perubahan tersimpan</span>
              </span>
            ) : saveStatus === "error" ? (
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <AlertCircle size={13} />
                <span>{statusMessage || "Gagal menyimpan"}</span>
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Ada perubahan belum disimpan</span>
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">Draft siap</span>
            )}
          </div>

          {/* Right: Actions, View Switcher & Publish */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                  viewMode === "edit"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
                title="Mode Dokumen / Editor"
              >
                Dokumen
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                  viewMode === "preview"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
                title="Mode Pratinjau Publik"
              >
                Pratinjau
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={cn(
                  "hidden xl:block px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                  viewMode === "split"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
                title="Berdampingan (Editor & Preview)"
              >
                Berdampingan
              </button>
            </div>

            {/* Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setShowSidebar((prev) => !prev)}
              className={cn(
                "p-2 rounded-lg border transition-colors cursor-pointer",
                showSidebar
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title={showSidebar ? "Sembunyikan Pengaturan Dokumen" : "Tampilkan Pengaturan Dokumen"}
            >
              {showSidebar ? <SidebarClose size={15} /> : <SidebarOpen size={15} />}
            </button>

            {/* Save Draft Button */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSave(ArticleStatus.DRAFT)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save size={13} />
              <span className="hidden sm:inline">Simpan Draft</span>
            </button>

            {/* Publish Button */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (status !== ArticleStatus.PUBLISHED) {
                  if (confirm("Publikasikan artikel ini agar dapat dibaca oleh publik & mahasiswa sekarang?")) {
                    handleSave(ArticleStatus.PUBLISHED);
                  }
                } else {
                  handleSave(ArticleStatus.PUBLISHED);
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Globe size={13} />
              <span>{status === ArticleStatus.PUBLISHED ? "Perbarui" : "Publikasikan"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* RECOVERED LOCAL DRAFT BANNER (If unsaved work detected from previous crash/reload) */}
      {recoveredDraft && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <RotateCcw size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="truncate">
              <strong>Draft lokal terdeteksi:</strong> Ditemukan perubahan yang belum disimpan ke server dari sesi sebelumnya ({new Date(recoveredDraft.savedAt).toLocaleTimeString("id-ID")}).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-medium">
            <button
              type="button"
              onClick={handleApplyRecoveredDraft}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold cursor-pointer shadow-2xs"
            >
              Pulihkan Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardRecoveredDraft}
              className="px-2.5 py-1 rounded hover:bg-amber-200/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[11px] cursor-pointer"
            >
              Abaikan
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto overflow-hidden">
        {/* CENTER / LEFT: DOCUMENT EDITING CANVAS */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {viewMode !== "preview" && editor && (
            /* STICKY RICH-TEXT TOOLBAR */
            <div className="sticky top-14 z-30 bg-white/95 dark:bg-[#0c1427]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
              <div className="flex flex-wrap items-center gap-0.5 text-slate-700 dark:text-slate-300">
                {/* History: Undo / Redo */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().undo().run();
                  }}
                  disabled={!editor.can().undo()}
                  title="Undo (Ctrl+Z)"
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                >
                  <Undo2 size={16} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().redo().run();
                  }}
                  disabled={!editor.can().redo()}
                  title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                >
                  <Redo2 size={16} />
                </button>

                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                {/* Headings */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setParagraph().run();
                  }}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer",
                    editor.isActive("paragraph")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Paragraf Normal"
                >
                  Teks
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleHeading({ level: 1 }).run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("heading", { level: 1 })
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Heading 1 (#)"
                >
                  <Heading1 size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("heading", { level: 2 })
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Heading 2 (##)"
                >
                  <Heading2 size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleHeading({ level: 3 }).run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("heading", { level: 3 })
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Heading 3 (###)"
                >
                  <Heading3 size={16} />
                </button>

                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                {/* Inline Formatting: Bold, Italic, Underline, Strike, Code */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBold().run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("bold")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Tebal (Ctrl+B)"
                >
                  <Bold size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleItalic().run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("italic")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Miring (Ctrl+I)"
                >
                  <Italic size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleUnderline().run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("underline")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Garis Bawah (Ctrl+U)"
                >
                  <UnderlineIcon size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleStrike().run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("strike")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Coretan (Strikethrough)"
                >
                  <Strikethrough size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleCode().run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer font-mono",
                    editor.isActive("code")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Kode Baris (`code`)"
                >
                  <Code size={16} />
                </button>

                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                {/* Lists */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBulletList().run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("bulletList")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Daftar Poin (Bullet List)"
                >
                  <List size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleOrderedList().run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("orderedList")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Daftar Berangka (Numbered List)"
                >
                  <ListOrdered size={16} />
                </button>

                {/* Blockquote & Code Block */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBlockquote().run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("blockquote")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Kutipan / Callout Box"
                >
                  <Quote size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleCodeBlock().run();
                  }}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer",
                    editor.isActive("codeBlock")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Blok Kode Program"
                >
                  &lt;/&gt;
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setHorizontalRule().run();
                  }}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Garis Pemisah (Divider)"
                >
                  <Minus size={16} />
                </button>

                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                {/* Link & Media */}
                <button
                  type="button"
                  onClick={openLinkModal}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive("link")
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Sisipkan/Edit Tautan (Ctrl+K)"
                >
                  <LinkIcon size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sisipkan Gambar"
                >
                  <ImageIcon size={16} />
                </button>

                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

                {/* Alignment */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setTextAlign("left").run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive({ textAlign: "left" })
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Rata Kiri"
                >
                  <AlignLeft size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setTextAlign("center").run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive({ textAlign: "center" })
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Rata Tengah"
                >
                  <AlignCenter size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setTextAlign("right").run();
                  }}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    editor.isActive({ textAlign: "right" })
                      ? "bg-blue-50 text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  title="Rata Kanan"
                >
                  <AlignRight size={16} />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().unsetAllMarks().clearNodes().run();
                  }}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Hapus Pemformatan"
                >
                  <RemoveFormatting size={16} />
                </button>
              </div>

              {/* Quick Word & Reading Count on Right */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>{stats.words} kata</span>
                <span>•</span>
                <span>~{stats.readingMinutes} min baca</span>
              </div>
            </div>
          )}

          {/* DOCUMENT BODY CANVAS (Word / Gutenberg style paper sheet) */}
          <div
            className={cn(
              "flex-1 p-4 sm:p-6 lg:p-8 flex justify-center",
              viewMode === "split" && "grid grid-cols-1 xl:grid-cols-2 gap-6"
            )}
          >
            {/* 2A. Main Document Sheet */}
            {viewMode !== "preview" && (
              <div className="w-full max-w-4xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs p-6 sm:p-10 lg:p-14 flex flex-col transition-colors">
                {/* Large Title Area */}
                <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <textarea
                    rows={1}
                    value={title}
                    onChange={(e) => {
                      handleTitleChange(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    placeholder="Tambahkan judul artikel..."
                    className="w-full resize-none overflow-hidden bg-transparent border-none text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-0 leading-tight"
                  />
                  {slug && (
                    <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-400">
                      <span className="text-slate-300 dark:text-slate-600">/articles/</span>
                      <span className="text-blue-600 dark:text-cyan-400">{slug}</span>
                    </div>
                  )}
                </div>

                {/* Tiptap Block Editor Content */}
                <div className="flex-1 min-h-[460px]">
                  <EditorContent editor={editor} />
                </div>

                {/* Canvas Footer Status */}
                <div className="mt-12 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>{stats.words} Kata</span>
                    <span>•</span>
                    <span>{stats.chars} Karakter</span>
                    <span>•</span>
                    <span>Estimasi {stats.readingMinutes} Menit Membaca</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Gunakan <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Ctrl+Z</kbd> untuk Undo
                  </div>
                </div>
              </div>
            )}

            {/* 2B. Live Preview Screen (Split or Preview Mode) */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div
                className={cn(
                  "w-full bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs p-6 sm:p-10 lg:p-14 overflow-y-auto",
                  viewMode === "preview" && "max-w-4xl"
                )}
              >
                <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Pratinjau Halaman Publik</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Status: <strong className="text-slate-700 dark:text-slate-200">{status}</strong>
                  </span>
                </div>

                {/* Preview Header */}
                <div className="space-y-4 mb-8">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    {title || "Judul Artikel Tanpa Nama"}
                  </h1>

                  {excerpt && (
                    <p className="text-base text-slate-600 dark:text-slate-300 italic border-l-2 border-cyan-500 pl-4 py-1 leading-relaxed">
                      {excerpt}
                    </p>
                  )}
                </div>

                {/* Rendered Content */}
                <ArticleContentRenderer content={content} />
              </div>
            )}
          </div>
        </main>

        {/* RIGHT: METADATA & PUBLISHING SIDEBAR (Collapsible) */}
        {showSidebar && (
          <aside className="w-80 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1427] p-5 flex flex-col gap-6 overflow-y-auto transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                Pengaturan Dokumen
              </h3>
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                title="Tutup Panel"
              >
                <X size={15} />
              </button>
            </div>

            {/* Status Publikasi */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                Status Publikasi
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ArticleStatus);
                  setIsDirty(true);
                  setSaveStatus("dirty");
                }}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value={ArticleStatus.DRAFT}>Draft (Privat / Belum Publik)</option>
                <option value={ArticleStatus.PUBLISHED}>Published (Terbit untuk Mahasiswa)</option>
                <option value={ArticleStatus.ARCHIVED}>Archived (Arsip)</option>
              </select>
            </div>

            {/* Mata Kuliah / Kategori */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                Mata Kuliah / Kurikulum
              </label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setIsDirty(true);
                  setSaveStatus("dirty");
                }}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Umum / Tanpa Mata Kuliah</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Slug URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                  Slug URL
                </label>
                {!slugManuallyEdited && (
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-mono font-medium">
                    (Auto)
                  </span>
                )}
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="slug-url-artikel"
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Tautan publik: <span className="font-mono text-slate-600 dark:text-slate-300">/articles/{slug || "..."}</span>
              </p>
            </div>

            {/* Ringkasan / Excerpt */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                Ringkasan / Excerpt
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  setIsDirty(true);
                  setSaveStatus("dirty");
                }}
                placeholder="Tuliskan 1-2 kalimat ringkasan artikel untuk ditampilkan pada kartu katalog..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                Gambar Sampul (Cover Image)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => {
                    setCoverImage(e.target.value);
                    setIsDirty(true);
                    setSaveStatus("dirty");
                  }}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              {coverImage && (
                <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-900">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage("");
                      setIsDirty(true);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                    title="Hapus sampul"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Tagar / Kategori */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                Tagar (Dipisah koma)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  setIsDirty(true);
                  setSaveStatus("dirty");
                }}
                placeholder="C#, .NET, Algoritma, OOP"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Artikel Unggulan (isFeatured) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => {
                    setIsFeatured(e.target.checked);
                    setIsDirty(true);
                    setSaveStatus("dirty");
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Jadikan Artikel Unggulan (Featured)</span>
              </label>
            </div>
          </aside>
        )}
      </div>

      {/* 3. MODAL: INSERT / EDIT LINK */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <LinkIcon size={16} className="text-blue-600 dark:text-cyan-400" />
                <span>Sisipkan Tautan</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {linkText && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Teks Terpilih
                  </label>
                  <input
                    type="text"
                    disabled
                    value={linkText}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL Tujuan (https://...)
                </label>
                <input
                  type="url"
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/artikel"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyLink();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              {linkUrl && (
                <button
                  type="button"
                  onClick={() => {
                    editor?.chain().focus().unsetLink().run();
                    setIsLinkModalOpen(false);
                    setLinkUrl("");
                  }}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Hapus Tautan
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyLink}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: INSERT IMAGE */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ImageIcon size={16} className="text-blue-600 dark:text-cyan-400" />
                <span>Sisipkan Gambar ke Dokumen</span>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab switch: Upload vs URL */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setImageUploadTab("upload")}
                className={cn(
                  "flex-1 py-1 rounded-md text-center transition-colors cursor-pointer",
                  imageUploadTab === "upload"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                Unggah Berkas (PC)
              </button>
              <button
                type="button"
                onClick={() => setImageUploadTab("url")}
                className={cn(
                  "flex-1 py-1 rounded-md text-center transition-colors cursor-pointer",
                  imageUploadTab === "url"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                Tautan URL Gambar
              </button>
            </div>

            {imageUploadTab === "upload" ? (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-cyan-400 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-900/40">
                  <Upload size={24} className="text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Klik atau Seret Berkas Gambar
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Mendukung JPG, PNG, WebP (Maks. 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>
                {isUploadingImage && (
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-blue-600 dark:text-cyan-400 py-1">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengunggah gambar...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Gambar
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teks Alternatif (Alt Text)
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Deskripsi singkat gambar..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              {imageUploadTab === "url" && (
                <button
                  type="button"
                  disabled={!imageUrl.trim()}
                  onClick={handleInsertImageUrl}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Sisipkan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
