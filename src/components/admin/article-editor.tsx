"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import { ArticleImageExtension } from "@/lib/editor/article-image-extension";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

import {
  ArrowLeft,
  Save,
  Globe,
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
  RemoveFormatting,
  Heading1,
  Heading2,
  Heading3,
  SidebarClose,
  SidebarOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
  RotateCcw,
} from "lucide-react";

import { cn, generateSlug } from "@/lib/utils";
import { createArticleAction, updateArticleAction, uploadArticleImageAction } from "@/lib/actions/articles";
import { ArticleContentRenderer } from "@/components/learning/article-content-renderer";
import { isHtmlContent, markdownToHtml } from "@/lib/editor/content-converter";
import { ArticleStatus } from "@prisma/client";

interface LocalDraftData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  subjectId: string;
  tags: string;
  status: ArticleStatus;
  savedAt: number;
}

interface SlashCommandItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  keywords: string[];
  action: (editor: Editor) => void;
  badge?: string;
}

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

  // Image Modal states
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [imageUploadTab, setImageUploadTab] = React.useState<"upload" | "url">("upload");
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = React.useState<string>("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageAlt, setImageAlt] = React.useState("");
  const [imageCaption, setImageCaption] = React.useState("");
  const [imageAlign, setImageAlign] = React.useState<"left" | "center" | "right">("center");
  const [imageSize, setImageSize] = React.useState<"small" | "medium" | "full">("full");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [imageModalError, setImageModalError] = React.useState("");
  const [urlTestError, setUrlTestError] = React.useState(false);

  // Local draft recovery notification
  const [recoveredDraft, setRecoveredDraft] = React.useState<LocalDraftData | null>(null);

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

  const uploadDirectRef = React.useRef<(file: File) => Promise<void>>(async () => {});

  // Slash Command Menu state & refs
  const [slashMenuOpen, setSlashMenuOpen] = React.useState(false);
  const [slashQuery, setSlashQuery] = React.useState("");
  const [slashIndex, setSlashIndex] = React.useState(0);
  const [slashCoords, setSlashCoords] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [slashRange, setSlashRange] = React.useState<{ from: number; to: number } | null>(null);
  const slashMenuRef = React.useRef<HTMLDivElement>(null);

  const slashMenuOpenRef = React.useRef(false);
  const slashIndexRef = React.useRef(0);
  const slashRangeRef = React.useRef<{ from: number; to: number } | null>(null);
  const filteredSlashCommandsRef = React.useRef<SlashCommandItem[]>([]);
  const executeSlashCommandRef = React.useRef<(cmd: SlashCommandItem) => void>(() => {});
  const checkSlashCommandRef = React.useRef<(currentEditor: Editor | null) => void>(() => {});

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
      ArticleImageExtension,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Ketik '/' untuk menambahkan gambar, heading, daftar, kutipan, atau kode...",
      }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-[520px] text-base leading-relaxed text-slate-800 dark:text-slate-200",
      },
      handleKeyDown(view, event) {
        if (slashMenuOpenRef.current && filteredSlashCommandsRef.current.length > 0) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSlashIndex((prev) => (prev + 1) % filteredSlashCommandsRef.current.length);
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSlashIndex(
              (prev) =>
                (prev - 1 + filteredSlashCommandsRef.current.length) %
                filteredSlashCommandsRef.current.length
            );
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            const currentItem =
              filteredSlashCommandsRef.current[slashIndexRef.current] ||
              filteredSlashCommandsRef.current[0];
            if (currentItem) {
              executeSlashCommandRef.current(currentItem);
            }
            return true;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setSlashMenuOpen(false);
            return true;
          }
        }
        return false;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith("image/")) {
            const file = items[i].getAsFile();
            if (file) {
              event.preventDefault();
              uploadDirectRef.current(file);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop(view, event, slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadDirectRef.current(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      setIsDirty(true);
      setSaveStatus("dirty");
      checkSlashCommandRef.current(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      checkSlashCommandRef.current(editor);
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
          queueMicrotask(() => {
            setRecoveredDraft(parsed);
          });
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
      } catch (err: unknown) {
        setSaveStatus("error");
        setStatusMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan artikel.");
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

  const openLinkModal = React.useCallback(() => {
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
  }, [editor]);

  // Keyboard shortcut Ctrl+K / Cmd+K to open Link Modal when editor is focused
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        if (editor && (editor.isFocused || document.activeElement?.closest(".tiptap"))) {
          e.preventDefault();
          e.stopPropagation();
          openLinkModal();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, openLinkModal]);

  // Image Upload, Paste, Drag-and-Drop & Modal Logic
  const resetImageModal = React.useCallback(() => {
    if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedImageFile(null);
    setFilePreviewUrl("");
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
    setImageAlign("center");
    setImageSize("full");
    setImageModalError("");
    setUrlTestError(false);
    setIsUploadingImage(false);
  }, [filePreviewUrl]);

  const openImageModal = React.useCallback(() => {
    resetImageModal();
    setIsImageModalOpen(true);
  }, [resetImageModal]);

  const handleSelectImageFile = (file: File) => {
    setImageModalError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setImageModalError("Format berkas tidak didukung. Harap gunakan gambar JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageModalError("Ukuran berkas gambar maksimal 5MB.");
      return;
    }

    if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setSelectedImageFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
    if (!imageAlt) {
      setImageAlt(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  const handleInsertUploadedImage = async () => {
    if (!selectedImageFile) {
      setImageModalError("Harap pilih berkas gambar terlebih dahulu.");
      return;
    }

    setIsUploadingImage(true);
    setImageModalError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      const res = await uploadArticleImageAction(formData);
      if (res.success && res.data?.url && editor) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "articleImage",
            attrs: {
              src: res.data.url,
              alt: imageAlt.trim() || selectedImageFile.name,
              caption: imageCaption.trim(),
              align: imageAlign,
              size: imageSize,
            },
          })
          .run();

        setIsImageModalOpen(false);
        resetImageModal();
        setStatusMessage("Gambar berhasil diunggah dan disisipkan!");
        setSaveStatus("dirty");
        setIsDirty(true);
      } else {
        setImageModalError(res.error || "Gagal mengunggah berkas gambar ke server.");
      }
    } catch (err: unknown) {
      setImageModalError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah gambar.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleInsertImageUrl = () => {
    setImageModalError("");
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      setImageModalError("Harap masukkan URL gambar.");
      return;
    }

    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("/")) {
      setImageModalError("URL gambar harus diawali dengan http:// atau https://");
      return;
    }

    if (trimmed.toLowerCase().startsWith("javascript:") || trimmed.toLowerCase().startsWith("data:text")) {
      setImageModalError("Protokol URL tidak diizinkan demi keamanan.");
      return;
    }

    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertContent({
        type: "articleImage",
        attrs: {
          src: trimmed,
          alt: imageAlt.trim(),
          caption: imageCaption.trim(),
          align: imageAlign,
          size: imageSize,
        },
      })
      .run();

    setIsImageModalOpen(false);
    resetImageModal();
    setStatusMessage("Gambar dari URL berhasil disisipkan!");
    setSaveStatus("dirty");
    setIsDirty(true);
  };

  const handleDirectImageUploadAndInsert = React.useCallback(
    async (file: File) => {
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
        setStatusMessage("Hanya berkas gambar (JPG, PNG, WebP) yang dapat disisipkan.");
        setSaveStatus("error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage("Ukuran gambar melebihi batas 5MB.");
        setSaveStatus("error");
        return;
      }

      setStatusMessage("Mengunggah gambar...");
      setSaveStatus("saving");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadArticleImageAction(formData);
        if (res.success && res.data?.url && editor) {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "articleImage",
              attrs: {
                src: res.data.url,
                alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
                caption: "",
                align: "center",
                size: "full",
              },
            })
            .run();
          setStatusMessage("Gambar berhasil disisipkan ke artikel!");
          setSaveStatus("dirty");
          setIsDirty(true);
        } else {
          setStatusMessage(res.error || "Gagal mengunggah gambar.");
          setSaveStatus("error");
        }
      } catch (err: unknown) {
        setStatusMessage(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
        setSaveStatus("error");
      }
    },
    [editor]
  );

  React.useEffect(() => {
    uploadDirectRef.current = handleDirectImageUploadAndInsert;
  }, [handleDirectImageUploadAndInsert]);

  // --------------------------------------------------------------------------
  // SLASH COMMAND PALETTE LOGIC
  // --------------------------------------------------------------------------
  const SLASH_COMMANDS: SlashCommandItem[] = React.useMemo(
    () => [
      {
        id: "image",
        title: "Gambar / Media",
        subtitle: "Unggah gambar (JPG, PNG, WebP) atau sisipkan dari URL",
        icon: ImageIcon,
        keywords: ["gambar", "image", "foto", "photo", "media", "unggah", "upload", "img", "pic"],
        badge: "Populer",
        action: () => openImageModal(),
      },
      {
        id: "h1",
        title: "Heading 1 (Judul Bab)",
        subtitle: "Judul bagian materi tingkat pertama",
        icon: Heading1,
        keywords: ["h1", "heading1", "judul", "title", "bab", "utama"],
        action: (ed) => ed.chain().focus().setHeading({ level: 1 }).run(),
      },
      {
        id: "h2",
        title: "Heading 2 (Subjudul)",
        subtitle: "Subjudul bagian materi tingkat kedua",
        icon: Heading2,
        keywords: ["h2", "heading2", "subjudul", "subtitle"],
        action: (ed) => ed.chain().focus().setHeading({ level: 2 }).run(),
      },
      {
        id: "h3",
        title: "Heading 3 (Sub-bagian)",
        subtitle: "Subjudul pendukung materi tingkat ketiga",
        icon: Heading3,
        keywords: ["h3", "heading3", "subbab", "section"],
        action: (ed) => ed.chain().focus().setHeading({ level: 3 }).run(),
      },
      {
        id: "bulletList",
        title: "Daftar Butir (Bullet List)",
        subtitle: "Daftar butir tanpa nomor urut",
        icon: List,
        keywords: ["bullet", "list", "daftar", "ul", "poin"],
        action: (ed) => ed.chain().focus().toggleBulletList().run(),
      },
      {
        id: "orderedList",
        title: "Daftar Berangka (Numbered List)",
        subtitle: "Daftar urutan langkah berangka 1, 2, 3...",
        icon: ListOrdered,
        keywords: ["number", "numbered", "nomor", "angka", "ol", "langkah"],
        action: (ed) => ed.chain().focus().toggleOrderedList().run(),
      },
      {
        id: "blockquote",
        title: "Kutipan / Catatan (Quote)",
        subtitle: "Kotak sorotan teks atau kutipan rujukan",
        icon: Quote,
        keywords: ["quote", "kutipan", "callout", "catatan", "blockquote"],
        action: (ed) => ed.chain().focus().toggleBlockquote().run(),
      },
      {
        id: "codeBlock",
        title: "Blok Kode Program",
        subtitle: "Kotak penulisan kode program sintaks berwarna",
        icon: Code,
        keywords: ["code", "kode", "program", "script", "pre"],
        action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: "divider",
        title: "Garis Pemisah (Divider)",
        subtitle: "Garis horizontal pembatas materi",
        icon: Minus,
        keywords: ["divider", "garis", "separator", "hr", "line", "pemisah"],
        action: (ed) => ed.chain().focus().setHorizontalRule().run(),
      },
      {
        id: "link",
        title: "Sisipkan Tautan (Link)",
        subtitle: "Buka dialog pembuatan tautan web (Ctrl+K)",
        icon: LinkIcon,
        keywords: ["link", "tautan", "url", "href"],
        action: () => openLinkModal(),
      },
      {
        id: "paragraph",
        title: "Teks Normal (Paragraf)",
        subtitle: "Kembalikan ke format paragraf teks biasa",
        icon: RemoveFormatting,
        keywords: ["paragraph", "normal", "plain", "paragraf", "reset", "teks"],
        action: (ed) => ed.chain().focus().setParagraph().run(),
      },
    ],
    [openImageModal, openLinkModal]
  );

  const filteredSlashCommands = React.useMemo(() => {
    if (!slashQuery.trim()) return SLASH_COMMANDS;
    const q = slashQuery.toLowerCase().trim();
    return SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.subtitle.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.includes(q))
    );
  }, [SLASH_COMMANDS, slashQuery]);

  const executeSlashCommand = React.useCallback(
    (cmd: SlashCommandItem) => {
      if (!editor) return;
      const range = slashRangeRef.current;
      if (range) {
        editor.chain().focus().deleteRange(range).run();
      }
      setSlashMenuOpen(false);
      setSlashQuery("");
      setSlashRange(null);

      setTimeout(() => {
        cmd.action(editor);
      }, 20);
    },
    [editor]
  );

  const checkSlashCommand = React.useCallback((currentEditor: Editor | null) => {
    if (!currentEditor || !currentEditor.isFocused) {
      setSlashMenuOpen(false);
      return;
    }
    const { from, to } = currentEditor.state.selection;
    if (from !== to) {
      setSlashMenuOpen(false);
      return;
    }

    const $from = currentEditor.state.selection.$from;
    const lineText = $from.parent.textContent;
    const posInParent = $from.parentOffset;
    const textUpToCursor = lineText.slice(0, posInParent);

    const slashMatch = textUpToCursor.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);
    if (slashMatch) {
      const query = slashMatch[1] || "";
      const slashFrom = from - query.length - 1;
      const slashTo = from;

      try {
        const coords = currentEditor.view.coordsAtPos(slashFrom);
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const menuHeight = 320;
        const left = Math.min(Math.max(16, coords.left), viewportWidth - 340);
        let top = coords.bottom + 8;
        if (top + menuHeight > viewportHeight && coords.top > menuHeight + 20) {
          top = coords.top - menuHeight - 8;
        }

        setSlashCoords({ top, left });
        setSlashQuery(query);
        setSlashRange({ from: slashFrom, to: slashTo });
        setSlashIndex(0);
        setSlashMenuOpen(true);
      } catch {
        setSlashMenuOpen(false);
      }
    } else {
      setSlashMenuOpen(false);
    }
  }, []);

  React.useEffect(() => {
    slashMenuOpenRef.current = slashMenuOpen;
  }, [slashMenuOpen]);

  React.useEffect(() => {
    slashIndexRef.current = slashIndex;
  }, [slashIndex]);

  React.useEffect(() => {
    slashRangeRef.current = slashRange;
  }, [slashRange]);

  React.useEffect(() => {
    filteredSlashCommandsRef.current = filteredSlashCommands;
  }, [filteredSlashCommands]);

  React.useEffect(() => {
    executeSlashCommandRef.current = executeSlashCommand;
  }, [executeSlashCommand]);

  React.useEffect(() => {
    checkSlashCommandRef.current = checkSlashCommand;
  }, [checkSlashCommand]);

  // Click outside to dismiss slash menu
  React.useEffect(() => {
    if (!slashMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setSlashMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [slashMenuOpen]);

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
                  onClick={openImageModal}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sisipkan Gambar ke Artikel"
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-cyan-500/10 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Sisipkan Gambar ke Artikel
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pilih gambar dari perangkat Anda atau masukkan melalui URL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetImageModal();
                  setIsImageModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message Banner */}
            {imageModalError && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Terjadi Kesalahan</p>
                  <p className="text-[11px] mt-0.5">{imageModalError}</p>
                </div>
              </div>
            )}

            {/* Tab switch: Upload vs URL */}
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-100 dark:bg-slate-900 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setImageUploadTab("upload");
                  setImageModalError("");
                }}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  imageUploadTab === "upload"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Upload size={14} />
                <span>Unggah Gambar (PC)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageUploadTab("url");
                  setImageModalError("");
                }}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  imageUploadTab === "url"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <LinkIcon size={14} />
                <span>Tautan URL Gambar</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            {imageUploadTab === "upload" ? (
              <div className="space-y-3">
                {!selectedImageFile ? (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-400 rounded-2xl transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 group">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-cyan-500/10 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                      <Upload size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Klik untuk memilih berkas atau seret gambar ke sini
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Mendukung JPG, JPEG, PNG, dan WebP (Maks. 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSelectImageFile(file);
                      }}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                ) : (
                  <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                        {filePreviewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={filePreviewUrl}
                            alt="Pratinjau"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {selectedImageFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {selectedImageFile.size / 1024 < 1024
                            ? `${(selectedImageFile.size / 1024).toFixed(1)} KB`
                            : `${(selectedImageFile.size / (1024 * 1024)).toFixed(2)} MB`}{" "}
                          • {selectedImageFile.type.replace("image/", "").toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer">
                            Ganti Berkas
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleSelectImageFile(file);
                              }}
                              className="hidden"
                              disabled={isUploadingImage}
                            />
                          </label>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImageFile(null);
                              setFilePreviewUrl("");
                            }}
                            className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    URL Gambar Publik
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setUrlTestError(false);
                      setImageModalError("");
                    }}
                    placeholder="https://images.unsplash.com/... atau https://domain.com/gambar.png"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pastikan tautan merupakan URL gambar langsung yang dapat diakses publik.
                  </p>
                </div>

                {imageUrl.trim() && (
                  <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Pratinjau Gambar:
                    </p>
                    <div className="relative max-h-36 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl.trim()}
                        alt="Pratinjau URL"
                        onLoad={() => setUrlTestError(false)}
                        onError={() => setUrlTestError(true)}
                        className="max-h-36 w-auto object-contain"
                      />
                    </div>
                    {urlTestError && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertCircle size={13} />
                        Peringatan: Gambar tidak dapat dimuat atau URL tidak valid.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* DETAIL SETTINGS: Alt Text, Caption, Alignment, Size */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teks Alternatif (Alt Text)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Jelaskan isi gambar untuk aksesibilitas..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Membantu pembaca layar (screen reader) dan optimasi SEO mesin pencari.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan Gambar (Caption){" "}
                  <span className="font-normal text-slate-400">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Contoh: Gambar 1. Arsitektur komponen web..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Alignment selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Posisi Gambar
                  </label>
                  <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setImageAlign("left")}
                      className={cn(
                        "flex-1 py-1 rounded text-center text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1",
                        imageAlign === "left"
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                      title="Rata Kiri"
                    >
                      <AlignLeft size={13} />
                      <span className="hidden sm:inline">Kiri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageAlign("center")}
                      className={cn(
                        "flex-1 py-1 rounded text-center text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1",
                        imageAlign === "center"
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                      title="Rata Tengah"
                    >
                      <AlignCenter size={13} />
                      <span className="hidden sm:inline">Tengah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageAlign("right")}
                      className={cn(
                        "flex-1 py-1 rounded text-center text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1",
                        imageAlign === "right"
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                      title="Rata Kanan"
                    >
                      <AlignRight size={13} />
                      <span className="hidden sm:inline">Kanan</span>
                    </button>
                  </div>
                </div>

                {/* Size selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ukuran Lebar
                  </label>
                  <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setImageSize("small")}
                      className={cn(
                        "flex-1 py-1 rounded text-center text-xs font-semibold transition-colors cursor-pointer",
                        imageSize === "small"
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                      title="Kecil (33% lebar)"
                    >
                      33%
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSize("medium")}
                      className={cn(
                        "flex-1 py-1 rounded text-center text-xs font-semibold transition-colors cursor-pointer",
                        imageSize === "medium"
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                      title="Sedang (66% lebar)"
                    >
                      66%
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSize("full")}
                      className={cn(
                        "flex-1 py-1 rounded text-center text-xs font-semibold transition-colors cursor-pointer",
                        imageSize === "full"
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                      title="Penuh (100% lebar)"
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload progress indicator */}
            {isUploadingImage && (
              <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/20 text-xs font-semibold text-blue-700 dark:text-cyan-300">
                <Loader2 size={16} className="animate-spin text-blue-600 dark:text-cyan-400" />
                <span>Mengunggah berkas gambar ke penyimpanan...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isUploadingImage}
                onClick={() => {
                  resetImageModal();
                  setIsImageModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              {imageUploadTab === "upload" ? (
                <button
                  type="button"
                  disabled={!selectedImageFile || isUploadingImage}
                  onClick={handleInsertUploadedImage}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-slate-950 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={14} />
                      <span>Sisipkan Gambar</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!imageUrl.trim() || isUploadingImage}
                  onClick={handleInsertImageUrl}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-slate-950 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ImageIcon size={14} />
                  <span>Sisipkan dari URL</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING SLASH COMMAND MENU */}
      {slashMenuOpen && filteredSlashCommands.length > 0 && (
        <div
          ref={slashMenuRef}
          style={{ top: `${slashCoords.top}px`, left: `${slashCoords.left}px` }}
          className="fixed z-50 w-72 sm:w-84 max-h-80 overflow-y-auto bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Sparkles size={12} className="text-blue-600 dark:text-cyan-400" />
              <span>Perintah Cepat</span>
            </span>
            {slashQuery ? (
              <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 font-bold">
                /{slashQuery}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Pilih atau ketik kata kunci</span>
            )}
          </div>

          <div className="py-1 space-y-0.5">
            {filteredSlashCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === slashIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeSlashCommand(cmd);
                  }}
                  onMouseEnter={() => setSlashIndex(idx)}
                  className={cn(
                    "w-full px-2.5 py-2 rounded-xl flex items-center gap-3 text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 font-semibold shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                      isSelected
                        ? "bg-blue-600 text-white dark:bg-cyan-400 dark:text-slate-950 border-transparent shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold truncate">{cmd.title}</p>
                      {cmd.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                          {cmd.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {cmd.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-2.5 py-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>↑↓ Navigasi</span>
            <span>↵ Terapkan</span>
            <span>Esc Tutup</span>
          </div>
        </div>
      )}
    </div>
  );
}
