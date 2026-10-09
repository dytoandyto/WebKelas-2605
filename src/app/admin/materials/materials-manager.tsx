"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  BookMarked,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Download,
  AlertTriangle,
  X,
  FileText,
  FileSpreadsheet,
  Video,
  Layers,
  Upload,
  Link2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { compressImageFile } from "@/lib/compress-image";
import { MaterialType } from "@prisma/client";
import { EmptyState } from "@/components/ui/empty-state";
import {
  createMaterialAction,
  updateMaterialAction,
  deleteMaterialAction,
} from "@/lib/actions/materials";
import {
  MaterialAttachment,
  parseAttachments,
} from "@/components/materials/material-card";

interface MaterialItem {
  id: string;
  title: string;
  description?: string | null;
  subjectId: string;
  type: MaterialType;
  fileUrl?: string | null;
  externalUrl?: string | null;
  fileName?: string | null;
  fileSize?: string | null;
  tags?: string | null;
  attachments?: string | null;
  createdAt: string | Date;
  subject?: {
    id: string;
    code: string;
    name: string;
  };
  uploader?: {
    id: string;
    name: string;
    role: string;
  };
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
}

interface MaterialsManagerProps {
  initialMaterials: MaterialItem[];
  subjects: SubjectItem[];
}

export function detectMaterialType(filename: string): MaterialType {
  const clean = filename.trim().toLowerCase();
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    if (clean.includes("youtube.com") || clean.includes("youtu.be") || clean.includes("vimeo.com")) {
      return MaterialType.VIDEO;
    }
    return MaterialType.LINK;
  }
  const ext = clean.split(".").pop() || "";
  if (ext === "pdf") return MaterialType.PDF;
  if (["ppt", "pptx", "pps", "ppsx", "key", "odp"].includes(ext)) return MaterialType.PPT;
  if (["doc", "docx", "odt", "rtf", "txt", "md"].includes(ext)) return MaterialType.DOC;
  if (["xls", "xlsx", "csv", "tsv", "ods"].includes(ext)) return MaterialType.XLS;
  if (["mp4", "mkv", "webm", "avi", "mov", "flv", "m4v"].includes(ext)) return MaterialType.VIDEO;
  if (["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext)) return MaterialType.IMAGE;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return MaterialType.OTHER;
  return MaterialType.PDF;
}

function getAttachmentBadge(type?: string) {
  const t = (type || "DOC").toUpperCase();
  if (t === "PDF") {
    return {
      bg: "bg-rose-500/15 text-rose-300 light:bg-rose-50 light:text-rose-700 border-rose-500/30",
      icon: <FileText size={14} className="text-rose-400" />,
    };
  }
  if (["PPT", "PPTX", "SLIDE", "KEY"].includes(t)) {
    return {
      bg: "bg-amber-500/15 text-amber-300 light:bg-amber-50 light:text-amber-700 border-amber-500/30",
      icon: <FileSpreadsheet size={14} className="text-amber-400" />,
    };
  }
  if (["XLS", "XLSX", "CSV", "SPREADSHEET"].includes(t)) {
    return {
      bg: "bg-emerald-500/15 text-emerald-300 light:bg-emerald-50 light:text-emerald-700 border-emerald-500/30",
      icon: <FileSpreadsheet size={14} className="text-emerald-400" />,
    };
  }
  if (["VIDEO", "MP4", "MKV", "WEBM"].includes(t)) {
    return {
      bg: "bg-purple-500/15 text-purple-300 light:bg-purple-50 light:text-purple-700 border-purple-500/30",
      icon: <Video size={14} className="text-purple-400" />,
    };
  }
  if (["LINK", "G-DRIVE", "URL"].includes(t)) {
    return {
      bg: "bg-cyan-500/15 text-cyan-300 light:bg-blue-50 light:text-blue-700 border-cyan-500/30",
      icon: <Link2 size={14} className="text-cyan-400" />,
    };
  }
  return {
    bg: "bg-blue-500/15 text-blue-300 light:bg-blue-50 light:text-blue-700 border-blue-500/30",
    icon: <FileText size={14} className="text-blue-400" />,
  };
}

export function MaterialsManager({ initialMaterials, subjects }: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formType, setFormType] = useState<MaterialType>(MaterialType.PDF);
  const [formDescription, setFormDescription] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formExternalUrl, setFormExternalUrl] = useState("");
  const [formFileName, setFormFileName] = useState("");
  const [formFileSize, setFormFileSize] = useState("");
  const [formTags, setFormTags] = useState("");

  // Multiple documents attachments state & drag-and-drop
  const [formAttachments, setFormAttachments] = useState<MaterialAttachment[]>([]);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocSize, setNewDocSize] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);

  const processUploadedFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Detect format from the first file and update formType automatically
    const primaryType = detectMaterialType(fileList[0].name);
    setFormType(primaryType);

    // If title is empty, use the first file's cleaned name
    if (!formTitle.trim()) {
      const cleanTitle = fileList[0].name.replace(/\.[^/.]+$/, "");
      setFormTitle(cleanTitle);
    }

    for (const file of fileList) {
      if (file.size > 40 * 1024 * 1024) {
        setErrorMessage(
          `Berkas "${file.name}" melebihi batas ukuran maksimal (40 MB). Silakan gunakan tautan Google Drive / Cloud untuk file yang sangat besar.`
        );
        continue;
      }

      const detected = detectMaterialType(file.name);
      const isImage = file.type.startsWith("image/") || detected === MaterialType.IMAGE;
      const ext = file.name.split(".").pop()?.toUpperCase() || detected;

      if (isImage) {
        try {
          const comp = await compressImageFile(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 });
          const displaySize =
            comp.isCompressed && comp.compressionRatio > 0
              ? `${comp.formattedSize} (hemat ${comp.compressionRatio}%)`
              : comp.formattedSize;

          setFormAttachments((prev) => [
            ...prev,
            {
              id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              url: comp.dataUrl,
              size: displaySize,
              type: "IMAGE",
            },
          ]);
        } catch {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const dataUrl = (loadEvent.target?.result as string) || "";
            setFormAttachments((prev) => [
              ...prev,
              {
                id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name: file.name,
                url: dataUrl,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                type: "IMAGE",
              },
            ]);
          };
          reader.readAsDataURL(file);
        }
      } else {
        const sizeInMB = file.size / (1024 * 1024);
        const formattedSize =
          sizeInMB < 0.1
            ? `${Math.round(file.size / 1024)} KB`
            : `${sizeInMB.toFixed(1)} MB`;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const dataUrl = (loadEvent.target?.result as string) || "";
          setFormAttachments((prev) => [
            ...prev,
            {
              id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              url: dataUrl,
              size: formattedSize,
              type: ext,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    }

    if (docFileInputRef.current) {
      docFileInputRef.current.value = "";
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  function handleFilesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
    }
  }

  function handleAddLinkDoc() {
    if (!newDocName.trim() || !newDocUrl.trim()) return;
    const detected = detectMaterialType(newDocName.trim() || newDocUrl.trim());
    const isDrive = newDocUrl.includes("drive.google.com");
    const ext = newDocName.split(".").pop()?.toUpperCase() || (isDrive ? "G-DRIVE" : "LINK");

    if (formAttachments.length === 0) {
      setFormType(detected !== MaterialType.DOC ? detected : MaterialType.LINK);
    }

    setFormAttachments((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: newDocName.trim(),
        url: newDocUrl.trim(),
        size: newDocSize.trim() || undefined,
        type: ext,
      },
    ]);
    setNewDocName("");
    setNewDocUrl("");
    setNewDocSize("");
    setShowAddDocModal(false);
  }

  function handleRemoveAttachment(id: string) {
    setFormAttachments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length > 0) {
        setFormType(detectMaterialType(next[0].name));
      }
      return next;
    });
  }

  const filtered = materials.filter((m) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchSubject = m.subject?.name.toLowerCase().includes(q) || m.subject?.code.toLowerCase().includes(q);
      const matchDesc = m.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchDesc) return false;
    }
    if (subjectFilter !== "ALL" && m.subjectId !== subjectFilter) return false;
    if (typeFilter !== "ALL" && m.type !== typeFilter) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingMaterial(null);
    setFormTitle("");
    setFormSubjectId(subjects[0]?.id || "");
    setFormType(MaterialType.PDF);
    setFormDescription("");
    setFormFileUrl("");
    setFormExternalUrl("");
    setFormFileName("");
    setFormFileSize("");
    setFormTags("");
    setFormAttachments([]);
    setShowAddDocModal(false);
    setIsDragging(false);
    dragCounterRef.current = 0;
    setNewDocName("");
    setNewDocUrl("");
    setNewDocSize("");
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (item: MaterialItem) => {
    setEditingMaterial(item);
    setFormTitle(item.title);
    setFormSubjectId(item.subjectId);
    setFormType(item.type);
    setFormDescription(item.description || "");
    setFormFileUrl(item.fileUrl || "");
    setFormExternalUrl(item.externalUrl || "");
    setFormFileName(item.fileName || "");
    setFormFileSize(item.fileSize || "");
    setFormTags(item.tags || "");
    setFormAttachments(parseAttachments(item.attachments));
    setShowAddDocModal(false);
    setIsDragging(false);
    dragCounterRef.current = 0;
    setNewDocName("");
    setNewDocUrl("");
    setNewDocSize("");
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const attachmentsJson = formAttachments.length > 0 ? JSON.stringify(formAttachments) : null;
    const computedFileName = formFileName || (formAttachments[0]?.name) || null;
    const computedFileSize =
      formFileSize ||
      (formAttachments.length === 1
        ? formAttachments[0].size || null
        : formAttachments.length > 1
        ? `${formAttachments.length} Berkas`
        : null);
    const computedFileUrl = formFileUrl || (formAttachments[0]?.url) || null;

    const payload = {
      title: formTitle,
      subjectId: formSubjectId || null,
      type: formType,
      description: formDescription || null,
      fileUrl: computedFileUrl,
      externalUrl: formExternalUrl || null,
      fileName: computedFileName,
      fileSize: computedFileSize,
      tags: formTags || null,
      attachments: attachmentsJson,
    };

    try {
      if (editingMaterial) {
        const res = await updateMaterialAction(editingMaterial.id, payload);
        if (!res.success) {
          setErrorMessage(res.error || "Gagal memperbarui materi");
          setLoading(false);
          return;
        }
        // Update local state
        const targetSubject = subjects.find((s) => s.id === formSubjectId);
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === editingMaterial.id
              ? {
                  ...m,
                  title: formTitle,
                  subjectId: formSubjectId,
                  type: formType,
                  description: formDescription,
                  fileUrl: computedFileUrl,
                  externalUrl: formExternalUrl,
                  fileName: computedFileName,
                  fileSize: computedFileSize,
                  tags: formTags,
                  attachments: attachmentsJson,
                  subject: targetSubject ? { ...targetSubject } : m.subject,
                }
              : m
          )
        );
      } else {
        const res = await createMaterialAction(payload);
        if (!res.success) {
          setErrorMessage(res.error || "Gagal membuat materi");
          setLoading(false);
          return;
        }
        // Add to local state
        const targetSubject = subjects.find((s) => s.id === formSubjectId);
        const newRecord: MaterialItem = {
          id: (res as any).data?.id || `mat-${Date.now()}`,
          title: formTitle,
          subjectId: formSubjectId,
          type: formType,
          description: formDescription,
          fileUrl: computedFileUrl,
          externalUrl: formExternalUrl,
          fileName: computedFileName,
          fileSize: computedFileSize,
          tags: formTags,
          attachments: attachmentsJson,
          createdAt: new Date(),
          subject: targetSubject ? { ...targetSubject } : undefined,
          uploader: { id: "admin", name: "Admin", role: "ADMIN" },
        };
        setMaterials((prev) => [newRecord, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      if (err?.message?.includes("Body exceeded") || err?.message?.includes("413") || err?.digest?.includes("E394")) {
        setErrorMessage("Ukuran total berkas terlalu besar. Silakan gunakan link Google Drive / Cloud untuk materi ini.");
      } else {
        setErrorMessage(err.message || "Terjadi kesalahan server");
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await deleteMaterialAction(deletingId);
      if (res.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== deletingId));
        setDeleteDialogOpen(false);
        setDeletingId(null);
      } else {
        alert(res.error || "Gagal menghapus materi");
      }
    } catch (err: any) {
      alert(err.message || "Gagal menghapus materi");
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
              placeholder="Cari materi kuliah, judul, atau deskripsi..."
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

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#040813]/80 light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-300 light:text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              {Object.values(MaterialType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <button
              onClick={openCreateModal}
              className="btn btn-primary btn-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Tambah Materi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="rounded-2xl bg-[#08152e]/85 light:bg-white border border-cyan-500/25 light:border-slate-200 backdrop-blur-xl shadow-xl overflow-hidden">
        {materials.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-7 h-7 stroke-[1.75]" />}
            title="No materials yet"
            description="Course materials and resources will appear here."
            action={
              <button
                onClick={openCreateModal}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>+ Add Material</span>
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-7 h-7 stroke-[1.75]" />}
            title="No materials found"
            description="No course materials match your search or filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyan-500/20 light:border-slate-200 bg-[#040914]/80 light:bg-slate-50 text-cyan-300 light:text-blue-700 font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Materi</th>
                  <th className="py-3.5 px-4 font-bold">Mata Kuliah</th>
                  <th className="py-3.5 px-4 font-bold">Format</th>
                  <th className="py-3.5 px-4 font-bold">Pengunggah</th>
                  <th className="py-3.5 px-4 font-bold">Tanggal</th>
                  <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 light:divide-slate-100">
                {filtered.map((mat) => (
                  <tr
                    key={mat.id}
                    className="hover:bg-cyan-500/5 light:hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white light:text-slate-900 text-sm">{mat.title}</div>
                      {mat.description && (
                        <div className="text-[11px] text-slate-400 light:text-slate-600 line-clamp-1 mt-0.5">
                          {mat.description}
                        </div>
                      )}
                      {mat.fileName && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {mat.fileName} {mat.fileSize && `(${mat.fileSize})`}
                        </div>
                      )}
                      {(() => {
                        const atts = parseAttachments(mat.attachments);
                        if (atts.length === 0) return null;
                        return (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-purple-400 light:text-purple-600 font-semibold">
                            <Layers size={11} />
                            <span>{atts.length} Dokumen Lampiran</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4">
                      {mat.subject ? (
                        <div>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/15 light:bg-blue-50 text-cyan-300 light:text-blue-700 font-mono font-bold text-[10px] border border-cyan-400/30 light:border-blue-200">
                            {mat.subject.code}
                          </span>
                          <div className="text-[11px] text-slate-300 light:text-slate-700 mt-0.5">
                            {mat.subject.name}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700 border border-purple-500/30">
                        {mat.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 light:text-slate-700">
                      {mat.uploader?.name || "Admin"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 light:text-slate-500 text-[11px]">
                      {formatDate(mat.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/materials/${mat.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-cyan-500/10 light:bg-blue-50 text-cyan-400 light:text-blue-600 hover:bg-cyan-500/20"
                          title="Buka Halaman Materi"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          onClick={() => openEditModal(mat)}
                          className="p-1.5 rounded-lg bg-white/5 light:bg-slate-100 text-slate-300 light:text-slate-700 hover:text-white hover:bg-cyan-500/20"
                          title="Edit Materi"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(mat.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          title="Hapus Materi"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#08152e] light:bg-white border border-cyan-500/30 light:border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 light:border-slate-200">
              <h3 className="font-bold text-base text-white light:text-slate-900 font-display">
                {editingMaterial ? "Edit Materi Kuliah" : "Tambah Materi Kuliah"}
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

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Judul Materi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Tulis judul materi"
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Mata Kuliah <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-400"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Deskripsi / Ringkasan Materi
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ringkasan poin-poin yang dibahas dalam materi ini..."
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Dokumen & Lampiran Drag-and-Drop Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 light:text-slate-800 font-bold flex items-center gap-1.5">
                    <Layers size={14} className="text-cyan-400 light:text-blue-600" />
                    <span>Dokumen & Berkas Materi</span>
                    {formAttachments.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 light:bg-blue-100 light:text-blue-700 border border-cyan-500/30 light:border-blue-200">
                        {formAttachments.length} berkas
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddDocModal((prev) => !prev)}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 light:text-blue-600 light:hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <Link2 size={12} />
                    <span>{showAddDocModal ? "Tutup Form Link" : "+ Tambah Link / Drive"}</span>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  multiple
                  ref={docFileInputRef}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.mp4,.mkv,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFilesUpload}
                />

                {/* Interactive Drag and Drop Zone */}
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => docFileInputRef.current?.click()}
                  className={cn(
                    "relative cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 select-none group",
                    isDragging
                      ? "border-cyan-400 bg-cyan-500/15 scale-[1.01] shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-2 ring-cyan-400/50"
                      : "border-cyan-500/30 light:border-slate-300 bg-[#040813]/60 light:bg-slate-50/70 hover:border-cyan-400/70 hover:bg-[#071329] light:hover:bg-slate-100/70"
                  )}
                >
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                        isDragging
                          ? "bg-cyan-500 text-black scale-110 shadow-lg shadow-cyan-500/40"
                          : "bg-cyan-500/15 light:bg-blue-100 text-cyan-400 light:text-blue-600 group-hover:scale-105"
                      )}
                    >
                      <Upload className={cn("w-5 h-5", isDragging && "animate-bounce")} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-100 light:text-slate-800">
                        {isDragging ? (
                          <span className="text-cyan-300 light:text-blue-600 font-extrabold">
                            Lepaskan berkas di sini untuk mengunggah!
                          </span>
                        ) : (
                          <>
                            Tarik & letakkan berkas materi di sini, atau{" "}
                            <span className="text-cyan-400 light:text-blue-600 underline underline-offset-2">
                              klik untuk memilih file
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 light:text-slate-500 mt-0.5">
                        Format otomatis terdeteksi: PDF, PPTX, DOCX, XLSX, Video, Gambar, ZIP (Maks. 50MB)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/15 text-rose-300 light:bg-rose-50 light:text-rose-700 border border-rose-500/30">
                        PDF
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 light:bg-amber-50 light:text-amber-700 border border-amber-500/30">
                        PPT / PPTX
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/15 text-blue-300 light:bg-blue-50 light:text-blue-700 border border-blue-500/30">
                        DOC / DOCX
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 light:bg-emerald-50 light:text-emerald-700 border border-emerald-500/30">
                        XLS / XLSX
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 light:bg-purple-50 light:text-purple-700 border border-purple-500/30">
                        VIDEO
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inline Add Link Form if toggled */}
                {showAddDocModal && (
                  <div className="p-3.5 rounded-xl bg-black/60 light:bg-white border border-cyan-400/30 light:border-blue-200 space-y-2.5 animate-in fade-in duration-150">
                    <div className="font-bold text-xs text-cyan-300 light:text-blue-700 flex items-center gap-1.5">
                      <Link2 size={13} />
                      <span>Tambah Dokumen via Link / Google Drive</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nama dokumen / materi"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <input
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={newDocUrl}
                        onChange={(e) => setNewDocUrl(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Keterangan ukuran (opsional, misal: 15 MB)"
                        value={newDocSize}
                        onChange={(e) => setNewDocSize(e.target.value)}
                        className="w-1/2 px-2.5 py-1.5 rounded-lg bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 text-xs focus:outline-none"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowAddDocModal(false)}
                          className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 text-xs"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleAddLinkDoc}
                          disabled={!newDocName.trim() || !newDocUrl.trim()}
                          className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs disabled:opacity-50 transition-colors"
                        >
                          Simpan Link
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attached files list */}
                {formAttachments.length > 0 && (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    <div className="text-[11px] font-semibold text-slate-400 light:text-slate-600 flex items-center justify-between pb-1">
                      <span>Daftar Berkas Terlampir:</span>
                      <span className="text-[10px] text-cyan-400 light:text-blue-600 font-mono">
                        Format otomatis disesuaikan ({formType})
                      </span>
                    </div>
                    {formAttachments.map((att) => {
                      const badge = getAttachmentBadge(att.type);
                      return (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 light:bg-white border border-cyan-500/20 light:border-slate-200 text-xs gap-2 group hover:border-cyan-400/50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="p-1.5 rounded-lg bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 shrink-0">
                              {badge.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "px-1.5 py-0.2 rounded font-mono font-bold text-[9px] uppercase border shrink-0",
                                    badge.bg
                                  )}
                                >
                                  {att.type || "FILE"}
                                </span>
                                <span
                                  className="font-semibold text-white light:text-slate-900 truncate"
                                  title={att.name}
                                >
                                  {att.name}
                                </span>
                              </div>
                              {att.size && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {att.size}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {att.url && (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 light:hover:text-blue-600 hover:bg-cyan-500/10 transition-colors"
                                title="Buka / Cek"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Hapus Berkas"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Tag / Topik (Opsional, pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Misal: Bab 1, Algoritma, Slide Kuliah"
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Collapsible Advanced Options */}
              <details className="group rounded-xl border border-cyan-500/20 light:border-slate-200 bg-[#040813]/40 light:bg-slate-50/50 p-2.5">
                <summary className="cursor-pointer text-[11px] font-semibold text-slate-400 hover:text-cyan-300 light:hover:text-blue-600 list-none flex items-center justify-between">
                  <span>Pengaturan Lanjutan (Link Eksternal & Informasi File Manual)</span>
                  <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="pt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                        Link Eksternal / Google Drive
                      </label>
                      <input
                        type="url"
                        value={formExternalUrl}
                        onChange={(e) => setFormExternalUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                        URL File Langsung (Opsional)
                      </label>
                      <input
                        type="text"
                        value={formFileUrl}
                        onChange={(e) => setFormFileUrl(e.target.value)}
                        placeholder="https://example.com/file.pdf"
                        className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                        Nama File Kustom (Opsional)
                      </label>
                      <input
                        type="text"
                        value={formFileName}
                        onChange={(e) => setFormFileName(e.target.value)}
                        placeholder="Nama file materi"
                        className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                        Ukuran File (Opsional)
                      </label>
                      <input
                        type="text"
                        value={formFileSize}
                        onChange={(e) => setFormFileSize(e.target.value)}
                        placeholder="Misal: 2.4 MB"
                        className="w-full px-3 py-2 rounded-xl bg-[#040813] light:bg-slate-50 border border-cyan-500/20 light:border-slate-200 text-slate-100 light:text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </details>

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
                  {loading ? "Menyimpan..." : editingMaterial ? "Simpan Perubahan" : "Tambah Materi"}
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
                Konfirmasi Hapus Materi
              </h3>
            </div>
            <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
              Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan.
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
                {loading ? "Menghapus..." : "Ya, Hapus Materi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
