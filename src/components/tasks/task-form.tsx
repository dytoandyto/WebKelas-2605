"use client";

import * as React from "react";
import { TaskStatus, TaskPriority, TaskType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TaskFormData {
  id?: string;
  title: string;
  description?: string;
  subjectId?: string;
  taskType: TaskType;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  groupName?: string;
  groupMembers?: string;
  attachmentUrl?: string;
  submissionUrl?: string;
  notes?: string;
}

export interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  subjects: { id: string; code: string; name: string }[];
  onSubmit: (data: TaskFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function TaskForm({
  initialData,
  subjects,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: TaskFormProps) {
  const [formData, setFormData] = React.useState<TaskFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    subjectId: initialData?.subjectId || "",
    taskType: initialData?.taskType || TaskType.INDIVIDUAL,
    deadline: initialData?.deadline
      ? new Date(initialData.deadline).toISOString().slice(0, 16)
      : new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    priority: initialData?.priority || TaskPriority.MEDIUM,
    status: initialData?.status || TaskStatus.TODO,
    groupName: initialData?.groupName || "",
    groupMembers: initialData?.groupMembers || "",
    attachmentUrl: initialData?.attachmentUrl || "",
    submissionUrl: initialData?.submissionUrl || "",
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isGroup = formData.taskType === TaskType.GROUP;
  const isAdditional = formData.taskType === TaskType.ADDITIONAL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Judul tugas wajib diisi";
    }

    if (!isAdditional && !formData.subjectId) {
      newErrors.subjectId = "Pilih mata kuliah untuk penugasan ini";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Tenggat waktu wajib ditentukan";
    }

    if (isGroup && !formData.groupName?.trim()) {
      newErrors.groupName = "Nama kelompok wajib diisi untuk tugas kelompok";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6 text-left", className)}>
      {/* ── 1. Basic Information ───────────────────────── */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 light:text-blue-600 font-mono">
          // 1. Informasi Dasar
        </h4>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
            Judul Tugas <span className="text-red-400">*</span>
          </label>
          <Input
            placeholder="Contoh: Laporan Analisis Sistem Basis Data Bab 3"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            error={errors.title}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
              Tipe Tugas <span className="text-red-400">*</span>
            </label>
            <Select
              value={formData.taskType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  taskType: e.target.value as TaskType,
                })
              }
            >
              <option value="INDIVIDUAL">Individu</option>
              <option value="GROUP">Kelompok</option>
              <option value="ADDITIONAL">Tambahan / Non-Mata Kuliah</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
              Mata Kuliah {!isAdditional && <span className="text-red-400">*</span>}
              {isAdditional && (
                <span className="text-xs text-[var(--text-muted)] ml-1 font-normal">
                  (Opsional)
                </span>
              )}
            </label>
            <Select
              value={formData.subjectId}
              onChange={(e) =>
                setFormData({ ...formData, subjectId: e.target.value })
              }
              error={errors.subjectId}
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* ── 2. Description ─────────────────────────────── */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 light:text-blue-600 font-mono">
          // 2. Deskripsi & Detail
        </h4>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
            Deskripsi Tugas
          </label>
          <Textarea
            rows={4}
            placeholder="Instruksi pengerjaan tugas, format pengumpulan, bobot penilaian..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
      </div>

      {/* ── 3. Scheduling & Priority ───────────────────── */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 light:text-blue-600 font-mono">
          // 3. Waktu & Prioritas
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
              Tenggat Waktu <span className="text-red-400">*</span>
            </label>
            <Input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              error={errors.deadline}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
              Prioritas
            </label>
            <Select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as TaskPriority,
                })
              }
            >
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
              <option value="URGENT">Mendesak</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
              Status Awal
            </label>
            <Select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as TaskStatus,
                })
              }
            >
              <option value="TODO">Belum Dimulai</option>
              <option value="IN_PROGRESS">Sedang Dikerjakan</option>
              <option value="SUBMITTED">Sudah Dikumpulkan</option>
              <option value="COMPLETED">Selesai</option>
            </Select>
          </div>
        </div>
      </div>

      {/* ── 4. Group Conditional Fields ────────────────── */}
      {isGroup && (
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-4 light:bg-purple-50/50 light:border-purple-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 light:text-purple-800 font-mono">
            // 4. Pengaturan Tugas Kelompok
          </h4>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
              Nama Kelompok <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="Contoh: Kelompok 04 (CyberGuard)"
              value={formData.groupName}
              onChange={(e) =>
                setFormData({ ...formData, groupName: e.target.value })
              }
              error={errors.groupName}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
              Daftar Anggota Kelompok
            </label>
            <Textarea
              rows={2}
              placeholder="1. Muhammad Farhan (Ketua)&#10;2. Alya Putri&#10;3. Dimas Pratama"
              value={formData.groupMembers}
              onChange={(e) =>
                setFormData({ ...formData, groupMembers: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {/* ── 5. Resources & Attachments ─────────────────── */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 light:text-blue-600 font-mono">
          // 5. Tautan & Lampiran
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
              URL Lampiran / Dokumen Soal
            </label>
            <Input
              placeholder="https://drive.google.com/..."
              value={formData.attachmentUrl}
              onChange={(e) =>
                setFormData({ ...formData, attachmentUrl: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
              URL Pengumpulan (LMS / Form)
            </label>
            <Input
              placeholder="https://lms.telkomuniversity.ac.id/..."
              value={formData.submissionUrl}
              onChange={(e) =>
                setFormData({ ...formData, submissionUrl: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Batal
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Simpan Tugas
        </Button>
      </div>
    </form>
  );
}
