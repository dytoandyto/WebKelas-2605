"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DailyNoteFormData {
  id?: string;
  title: string;
  date: string;
  subjectId?: string;
  summary?: string;
  content: string;
  importantPoints?: string;
  nextSteps?: string;
  tags?: string;
}

export interface DailyNoteEditorProps {
  initialData?: Partial<DailyNoteFormData>;
  subjects: { id: string; code: string; name: string }[];
  onSubmit: (data: DailyNoteFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function DailyNoteEditor({
  initialData,
  subjects,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: DailyNoteEditorProps) {
  const [formData, setFormData] = React.useState<DailyNoteFormData>({
    title: initialData?.title || "",
    date: initialData?.date
      ? new Date(initialData.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    subjectId: initialData?.subjectId || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    importantPoints: initialData?.importantPoints || "",
    nextSteps: initialData?.nextSteps || "",
    tags: initialData?.tags || "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Judul catatan jurnal wajib diisi";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Isi catatan perkuliahan wajib diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "max-w-[800px] mx-auto space-y-6 text-left p-4 sm:p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <div className="space-y-1 pb-3 border-b border-[var(--border-color)]">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          {formData.id ? "Edit Catatan Jurnal" : "Tulis Catatan Jurnal Baru"}
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Format penulisan yang nyaman dan fokus untuk dokumentasi perkuliahan kelas.
        </p>
      </div>

      {/* Meta Row: Date & Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
            Tanggal Kuliah <span className="text-red-400">*</span>
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
            Mata Kuliah Terkait
          </label>
          <Select
            value={formData.subjectId}
            onChange={(e) =>
              setFormData({ ...formData, subjectId: e.target.value })
            }
          >
            <option value="">-- Tanpa Mata Kuliah Spesifik --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
          Judul Catatan <span className="text-red-400">*</span>
        </label>
        <Input
          placeholder="Tulis judul catatan"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />
      </div>

      {/* Summary */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
          Ringkasan Singkat (1-2 Paragraf)
        </label>
        <Textarea
          rows={2}
          placeholder="Tulis ringkasan catatan..."
          value={formData.summary}
          onChange={(e) =>
            setFormData({ ...formData, summary: e.target.value })
          }
        />
      </div>

      {/* Main Content Body */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
          Isi Catatan Lengkap <span className="text-red-400">*</span>
        </label>
        <Textarea
          rows={10}
          placeholder="Tulis catatan lengkap..."
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          error={errors.content}
          className="font-sans leading-relaxed"
        />
      </div>

      {/* Important Points & Next Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
            Poin Penting / Key Takeaways
          </label>
          <Textarea
            rows={3}
            placeholder="Tulis poin-poin penting..."
            value={formData.importantPoints}
            onChange={(e) =>
              setFormData({ ...formData, importantPoints: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
            Tindak Lanjut / Tugas Mendatang
          </label>
          <Textarea
            rows={3}
            placeholder="Tulis tindak lanjut atau rencana berikutnya..."
            value={formData.nextSteps}
            onChange={(e) =>
              setFormData({ ...formData, nextSteps: e.target.value })
            }
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
          Tags (Pisahkan dengan koma)
        </label>
        <Input
          placeholder="Tulis tag dipisahkan koma..."
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        />
      </div>

      {/* Actions */}
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
          Simpan Catatan
        </Button>
      </div>
    </form>
  );
}
