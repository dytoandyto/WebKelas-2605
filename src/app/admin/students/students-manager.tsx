"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  ExternalLink,
  Loader2,
  Star,
  Upload,
  X,
  FileSpreadsheet,
  Download,
  ChevronDown,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Sparkles,
  Globe,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import {
  createStudentAction,
  updateStudentAction,
  deleteStudentAction,
  toggleStudentPublishAction,
  toggleStudentPhotoApprovalAction,
} from "@/lib/actions/students";
import {
  cn,
  formatExternalUrl,
  formatGithubUrl,
  formatInstagramUrl,
  formatLinkedinUrl,
  formatPhotoUrl,
  isGoogleDriveUrl,
  getGoogleDriveViewUrl,
} from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { compressImageFile } from "@/lib/compress-image";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/components/ui/toast";
import { ImportStudentsModal } from "./import-students-modal";

export interface StudentItem {
  id: string;
  name: string;
  nickname?: string | null;
  studentNumber?: string | null;
  major: string;
  photoUrl?: string | null;
  bio?: string | null;
  dream?: string | null;
  motivation?: string | null;
  organization?: string | null;
  isPublished?: boolean;
  photoApproved?: boolean;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  instagramUrl?: string | null;
  achievements?: any[];
}

interface StudentsManagerProps {
  initialStudents: StudentItem[];
  majors?: string[];
}

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

export function StudentsManager({ initialStudents }: StudentsManagerProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Sync state if initialStudents changes (e.g. after router.refresh())
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    studentNumber: "",
    major: "Sistem Informasi",
    photoUrl: "",
    bio: "",
    dream: "",
    motivation: "",
    organization: "",
    isPublished: true,
    photoApproved: true,
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    instagramUrl: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentItem | null>(null);

  // Image Upload Handler
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      setFormError("Ukuran file foto maksimal 30 MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("File harus berupa gambar (JPG, PNG, WebP, dll).");
      return;
    }

    setCompressing(true);
    setFormError(null);
    try {
      const res = await compressImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
      });
      setFormData((prev) => ({ ...prev, photoUrl: res.dataUrl }));
      if (res.isCompressed && res.compressionRatio > 0) {
        setCompressionInfo(
          `Terkompresi otomatis: ${res.originalFormattedSize} → ${res.formattedSize} (Hemat ${res.compressionRatio}%)`
        );
      } else {
        setCompressionInfo(`Ukuran: ${res.formattedSize}`);
      }
    } catch {
      setFormError("Gagal memproses dan mengompresi foto profil.");
    } finally {
      setCompressing(false);
    }
  }

  function openCreateModal() {
    setEditingStudent(null);
    setFormData({
      name: "",
      nickname: "",
      studentNumber: "",
      major: "Sistem Informasi",
      photoUrl: "",
      bio: "",
      dream: "",
      motivation: "",
      organization: "",
      isPublished: true,
      photoApproved: true,
      githubUrl: "",
      linkedinUrl: "",
      portfolioUrl: "",
      instagramUrl: "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCompressionInfo(null);
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(student: StudentItem) {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nickname: student.nickname || "",
      studentNumber: student.studentNumber || "",
      major: student.major || "Sistem Informasi",
      photoUrl: student.photoUrl || "",
      bio: student.bio || "",
      dream: student.dream || "",
      motivation: student.motivation || "",
      organization: student.organization || "",
      isPublished: student.isPublished !== false,
      photoApproved: student.photoApproved !== false,
      githubUrl: student.githubUrl || "",
      linkedinUrl: student.linkedinUrl || "",
      portfolioUrl: student.portfolioUrl || "",
      instagramUrl: student.instagramUrl || "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCompressionInfo(null);
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(student: StudentItem) {
    setDeletingStudent(student);
    setDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false);
    setDeletingStudent(null);
  }

  async function handleTogglePublish(student: StudentItem) {
    setTogglingId(student.id);
    const newStatus = student.isPublished === false;
    // Optimistic update
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, isPublished: newStatus } : s))
    );
    try {
      const res = await toggleStudentPublishAction(student.id);
      if (!res.success) {
        // Rollback
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, isPublished: !newStatus } : s))
        );
      }
    } catch {
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, isPublished: !newStatus } : s))
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleTogglePhotoApproval(student: StudentItem) {
    setTogglingId(student.id);
    const newStatus = student.photoApproved === false;
    // Optimistic update
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, photoApproved: newStatus } : s))
    );
    try {
      const res = await toggleStudentPhotoApprovalAction(student.id);
      if (!res.success) {
        // Rollback
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, photoApproved: !newStatus } : s))
        );
      }
    } catch {
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, photoApproved: !newStatus } : s))
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Nama lengkap wajib diisi.");
      return;
    }
    if (!formData.major.trim()) {
      setFormError("Program studi wajib diisi.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: formData.name.trim(),
        nickname: formData.nickname.trim() || null,
        studentNumber: formData.studentNumber.trim() || null,
        major: formData.major.trim(),
        photoUrl: formData.photoUrl.trim()
          ? isGoogleDriveUrl(formData.photoUrl.trim())
            ? getGoogleDriveViewUrl(formData.photoUrl.trim())
            : formatPhotoUrl(formData.photoUrl.trim())
          : null,
        bio: formData.bio.trim() || null,
        dream: formData.dream.trim() || null,
        motivation: formData.motivation.trim() || null,
        organization: formData.organization.trim() || null,
        isPublished: formData.isPublished,
        photoApproved: formData.photoApproved,
        githubUrl: formData.githubUrl.trim() ? formatGithubUrl(formData.githubUrl.trim()) : null,
        linkedinUrl: formData.linkedinUrl.trim() ? formatLinkedinUrl(formData.linkedinUrl.trim()) : null,
        portfolioUrl: formData.portfolioUrl.trim() ? formatExternalUrl(formData.portfolioUrl.trim()) : null,
        instagramUrl: formData.instagramUrl.trim() ? formatInstagramUrl(formData.instagramUrl.trim()) : null,
      };

      if (editingStudent) {
        const res = await updateStudentAction(editingStudent.id, payload);
        if (!res.success) {
          setFormError(res.error || "Gagal memperbarui profil mahasiswa.");
        } else {
          setStudents((prev) =>
            prev.map((s) =>
              s.id === editingStudent.id
                ? {
                    ...s,
                    ...payload,
                  }
                : s
            )
          );
          setModalOpen(false);
        }
      } else {
        const res = await createStudentAction(payload);
        if (!res.success) {
          setFormError(res.error || "Gagal menambahkan mahasiswa baru.");
        } else {
          const newStudent: StudentItem = {
            id: res.data?.id || `temp-${Date.now()}`,
            ...payload,
            achievements: [],
          };
          setStudents((prev) => [newStudent, ...prev]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingStudent) return;
    const studentToDelete = deletingStudent;
    try {
      const res = await deleteStudentAction(studentToDelete.id);
      if (res.success) {
        setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
        setDeleteDialogOpen(false);
        setDeletingStudent(null);
        showToast({
          title: "Mahasiswa Berhasil Dihapus",
          description: `Data profil ${studentToDelete.name} telah berhasil dihapus.`,
          type: "success",
        });
      } else {
        showToast({
          title: "Gagal Menghapus Mahasiswa",
          description: res.error || "Gagal menghapus data mahasiswa.",
          type: "error",
        });
        throw new Error(res.error || "Gagal menghapus data mahasiswa.");
      }
    } catch (err: any) {
      showToast({
        title: "Gagal Menghapus Mahasiswa",
        description: err.message || "Terjadi kesalahan saat menghapus data mahasiswa.",
        type: "error",
      });
      throw err;
    }
  }

  // Filter calculations
  const totalCount = students.length;
  const publishedCount = students.filter((s) => s.isPublished !== false).length;
  const draftCount = students.filter((s) => s.isPublished === false).length;

  const filteredStudents = students.filter((s) => {
    if (statusFilter === "PUBLISHED" && s.isPublished === false) return false;
    if (statusFilter === "DRAFT" && s.isPublished !== false) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.nickname && s.nickname.toLowerCase().includes(q)) ||
      (s.studentNumber && s.studentNumber.toLowerCase().includes(q)) ||
      (s.organization && s.organization.toLowerCase().includes(q))
    );
  });

  // Query string helper for export with current filters
  const exportParams = new URLSearchParams();
  if (statusFilter !== "ALL") {
    exportParams.set("status", statusFilter.toLowerCase());
  }
  if (searchQuery.trim()) {
    exportParams.set("search", searchQuery.trim());
  }
  const filterQueryString = exportParams.toString() ? `&${exportParams.toString()}` : "";

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, panggilan, NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input text-xs pl-8 pr-3 py-2 w-full rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Status Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all",
                statusFilter === "ALL"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Semua ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PUBLISHED")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                statusFilter === "PUBLISHED"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Eye size={12} />
              <span>Published ({publishedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DRAFT")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                statusFilter === "DRAFT"
                  ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <EyeOff size={12} />
              <span>Draft ({draftCount})</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Template, Export, Import, Add */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Dropdown */}
          <Dropdown>
            <DropdownTrigger asChild>
              <button
                type="button"
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-xs transition-colors"
                title="Unduh template Excel atau CSV dengan petunjuk format"
              >
                <Download size={14} className="text-slate-500" />
                <span>Template</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
            </DropdownTrigger>
            <DropdownMenu align="right">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Format Template
              </div>
              <a
                href="/api/admin/students/template?format=xlsx"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                <span>Template Excel (.xlsx)</span>
              </a>
              <a
                href="/api/admin/students/template?format=csv"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-blue-500" />
                <span>Template CSV (.csv)</span>
              </a>
            </DropdownMenu>
          </Dropdown>

          {/* Export Data Dropdown */}
          <Dropdown>
            <DropdownTrigger asChild>
              <button
                type="button"
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-xs transition-colors"
                title="Ekspor data mahasiswa ke Excel atau CSV"
              >
                <Download size={14} className="text-emerald-500" />
                <span>Export Data</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
            </DropdownTrigger>
            <DropdownMenu align="right" className="min-w-[220px]">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Ekspor Administratif (Lengkap)
              </div>
              <a
                href={`/api/admin/students/export?format=xlsx&scope=admin${filterQueryString}`}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                <span>Excel (.xlsx) Admin</span>
              </a>
              <a
                href={`/api/admin/students/export?format=csv&scope=admin${filterQueryString}`}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-blue-500" />
                <span>CSV (.csv) Admin</span>
              </a>

              <DropdownSeparator />

              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Ekspor Publik (NIM Disaring)
              </div>
              <a
                href={`/api/admin/students/export?format=xlsx&scope=public${filterQueryString}`}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                <span>Excel (.xlsx) Publik</span>
              </a>
              <a
                href={`/api/admin/students/export?format=csv&scope=public${filterQueryString}`}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-blue-500" />
                <span>CSV (.csv) Publik</span>
              </a>
            </DropdownMenu>
          </Dropdown>

          {/* Import Mahasiswa Button */}
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-blue-200 dark:border-cyan-800 bg-blue-50 dark:bg-cyan-950/40 text-blue-700 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-cyan-900/50 flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <FileSpreadsheet size={14} />
            <span>Import Mahasiswa</span>
          </button>

          {/* Add Student Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={16} />
            <span>Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="card border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {students.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7 stroke-[1.75]" />}
            title="Belum ada data mahasiswa"
            description="Mulai kelola direktori kelas dengan menambahkan profil mahasiswa atau mengimpor file spreadsheet."
            action={
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-blue-200 dark:border-cyan-800 bg-blue-50 dark:bg-cyan-950/40 text-blue-700 dark:text-cyan-300 hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={14} />
                  <span>Import Excel / CSV</span>
                </button>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={16} />
                  <span>Tambah Manual</span>
                </button>
              </div>
            }
          />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7 stroke-[1.75]" />}
            title="Mahasiswa tidak ditemukan"
            description="Tidak ada mahasiswa yang cocok dengan kriteria pencarian atau filter status."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Mahasiswa</th>
                  <th className="py-3.5 px-6">Bio, Impian & Motto</th>
                  <th className="py-3.5 px-6">Status Publikasi & Foto</th>
                  <th className="py-3.5 px-6">Prestasi</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                    {/* Student Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={st.photoUrl}
                          name={st.name}
                          size="md"
                          className="shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white leading-snug flex items-center gap-1.5">
                            <span>{st.name}</span>
                            {st.nickname && (
                              <span className="text-[11px] font-normal text-slate-400">
                                ({st.nickname})
                              </span>
                            )}
                          </div>
                          {st.studentNumber ? (
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              NIM: {st.studentNumber}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic mt-0.5">
                              NIM belum diisi
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Bio, Impian & Motto */}
                    <td className="py-4 px-6 max-w-xs space-y-1">
                      {st.organization && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md mb-0.5">
                          <Building2 size={11} />
                          <span className="truncate max-w-[160px]">{st.organization}</span>
                        </div>
                      )}
                      {st.bio ? (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2" title={st.bio}>
                          {st.bio}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-400 italic block">Belum ada bio / latar belakang</span>
                      )}
                      {st.dream && (
                        <p className="text-[11px] text-brand-600 dark:text-cyan-400 line-clamp-1 font-medium" title={st.dream}>
                          <span className="font-semibold text-slate-500 dark:text-slate-400">Impian:</span> {st.dream}
                        </p>
                      )}
                      {st.motivation && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 line-clamp-1 italic" title={st.motivation}>
                          <span className="font-semibold not-italic text-slate-500 dark:text-slate-400">Motto:</span> &ldquo;{st.motivation}&rdquo;
                        </p>
                      )}
                    </td>

                    {/* Status Publikasi & Foto */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5 items-start">
                        {/* Publish Status Toggle */}
                        <button
                          type="button"
                          disabled={togglingId === st.id}
                          onClick={() => handleTogglePublish(st)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs cursor-pointer",
                            st.isPublished !== false
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                          )}
                          title="Klik untuk ubah status publikasi profil"
                        >
                          {togglingId === st.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : st.isPublished !== false ? (
                            <Eye size={12} className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <EyeOff size={12} className="text-slate-400" />
                          )}
                          <span>{st.isPublished !== false ? "Published" : "Draft"}</span>
                        </button>

                        {/* Photo Approval Toggle */}
                        <button
                          type="button"
                          disabled={togglingId === st.id}
                          onClick={() => handleTogglePhotoApproval(st)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer",
                            st.photoApproved !== false
                              ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 hover:bg-teal-100"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100"
                          )}
                          title="Klik untuk ubah persetujuan tampil foto publik"
                        >
                          <ShieldCheck size={11} />
                          <span>{st.photoApproved !== false ? "Foto Disetujui" : "Foto Tertunda"}</span>
                        </button>
                      </div>
                    </td>

                    {/* Achievements */}
                    <td className="py-4 px-6">
                      {st.achievements && st.achievements.length > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{st.achievements.length} penghargaan</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">&mdash;</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {st.instagramUrl && (
                          <a
                            href={formatInstagramUrl(st.instagramUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-icon p-1.5 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                            title="Instagram"
                          >
                            <InstagramIcon size={15} />
                          </a>
                        )}
                        {st.portfolioUrl && (
                          <a
                            href={formatExternalUrl(st.portfolioUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-icon p-1.5 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                            title="Portofolio Web"
                          >
                            <Globe size={15} />
                          </a>
                        )}
                        <Link
                          href={`/students/${st.id}`}
                          target="_blank"
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Lihat Profil Publik"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(st)}
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-cyan-400"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(st);
                          }}
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                          title="Hapus Mahasiswa"
                          aria-label={`Hapus ${st.name}`}
                        >
                          <Trash2 size={15} />
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
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? "Edit Profil Mahasiswa" : "Tambah Mahasiswa ke Direktori"}
        description="Kelola informasi akademik, biografi, cita-cita, pengalaman organisasi, dan izin publikasi."
        maxWidth="xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          {/* Row 1: Nama Lengkap & Panggilan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Muhammad Farhan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Nama Panggilan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Farhan"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 2: NIM & Program Studi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                NIM (Arsip Internal Admin - Tidak Publik)
              </label>
              <input
                type="text"
                placeholder="Contoh: 1204210001"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Program Studi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Sistem Informasi"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Foto Profil */}
          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Foto Profil (Opsional)
            </label>
            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-xs relative">
                {compressing ? (
                  <Loader2 size={22} className="animate-spin text-white" />
                ) : formData.photoUrl ? (
                  <Avatar
                    src={formData.photoUrl}
                    name={formData.name || "Preview"}
                    size="lg"
                    className="w-full h-full border-0 shadow-none ring-0"
                  />
                ) : (
                  <Users size={22} className="text-white/80" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    disabled={compressing}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-60"
                  >
                    {compressing ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Mengompresi...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>{formData.photoUrl ? "Ganti Foto" : "Pilih File Foto"}</span>
                      </>
                    )}
                  </button>
                  {formData.photoUrl && !compressing && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, photoUrl: "" }));
                        setCompressionInfo(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1 transition-colors"
                    >
                      <X size={13} />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
                {compressionInfo ? (
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    ⚡ {compressionInfo}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Bisa unggah file foto (JPG/PNG/WebP maks 30MB, otomatis dikompresi) atau tempel URL.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2">
              <input
                type="url"
                placeholder="Atau masukkan URL foto langsung (Google Drive, Unsplash, https://...)"
                value={formData.photoUrl.startsWith("data:") ? "" : formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
              {isGoogleDriveUrl(formData.photoUrl) && (
                <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 p-2 rounded-lg border border-cyan-200 dark:border-cyan-800/50">
                  <CheckCircle2 size={13} className="shrink-0 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                  <span>
                    Tautan Google Drive terdeteksi. Sistem akan otomatis menampilkan foto profil secara aman di website.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Publikasi & Persetujuan Foto Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Publikasikan Profil (Published)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Jika tidak dicentang, profil berstatus Draft dan hanya dapat dilihat oleh admin.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.photoApproved}
                onChange={(e) => setFormData({ ...formData, photoApproved: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Foto Disetujui untuk Publik
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Jika tidak dicentang, foto profil disembunyikan dari publik sampai ada persetujuan.
                </span>
              </div>
            </label>
          </div>

          {/* Bio & Organisasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Organisasi / Kepanitiaan
              </label>
              <input
                type="text"
                placeholder="Contoh: Himpunan Mahasiswa SI, BEM"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Cita-cita / Aspirasi Karir
              </label>
              <input
                type="text"
                placeholder="Contoh: Enterprise Architect"
                value={formData.dream}
                onChange={(e) => setFormData({ ...formData, dream: e.target.value })}
                className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Bio & Latar Belakang
            </label>
            <textarea
              placeholder="Ceritakan tentang minat, keahlian, atau hobi..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[75px] p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full resize-y focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Motto / Motivasi
            </label>
            <input
              type="text"
              placeholder="Contoh: Never stop learning and building"
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                <InstagramIcon size={13} className="text-pink-500" />
                Instagram
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/..."
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs w-full focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">GitHub</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs w-full focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">LinkedIn</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs w-full focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">Portofolio</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs w-full focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            {editingStudent ? (
              <button
                type="button"
                onClick={() => {
                  const target = editingStudent;
                  setModalOpen(false);
                  openDeleteDialog(target);
                }}
                className="btn btn-ghost text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg"
                title="Hapus data profil mahasiswa ini"
              >
                <Trash2 size={14} />
                <span>Hapus Profil</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn btn-secondary text-sm font-medium px-4 py-2 cursor-pointer"
                disabled={isPending}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary text-sm font-medium px-5 py-2 flex items-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 size={15} className="animate-spin" />}
                <span>{editingStudent ? "Simpan Perubahan" : "Tambah Mahasiswa"}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Mahasiswa"
        description="Apakah Anda yakin ingin menghapus data profil mahasiswa ini? Data prestasi yang terhubung akan tetap aman."
        itemTitle={deletingStudent?.name}
        confirmText="Hapus Mahasiswa"
        cancelText="Batal"
      />

      {/* Import Students Wizard Modal */}
      <ImportStudentsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportCompleted={() => {
          router.refresh();
        }}
        existingStudents={students.map((s) => ({
          id: s.id,
          name: s.name,
          studentNumber: s.studentNumber,
        }))}
      />
    </div>
  );
}
