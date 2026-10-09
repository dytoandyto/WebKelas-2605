"use client";

import React from "react";
import { TasksSettings } from "@/lib/homepage/types";

interface TasksEditorProps {
  settings: TasksSettings;
  onChange: (updated: TasksSettings) => void;
}

export function TasksEditor({ settings, onChange }: TasksEditorProps) {
  function handleChange<K extends keyof TasksSettings>(field: K, value: TasksSettings[K]) {
    onChange({
      ...settings,
      [field]: value,
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Judul Section
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Tugas & Deadline Terdekat"
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Teks Tombol Aksi
          </label>
          <input
            type="text"
            value={settings.buttonText}
            onChange={(e) => handleChange("buttonText", e.target.value)}
            placeholder="Lihat Semua Tugas"
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-text-primary mb-1 block">
          Deskripsi Section
        </label>
        <textarea
          value={settings.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={2}
          placeholder="Pantau tenggat waktu tugas agar tidak terlewatkan..."
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Maksimal Tugas Ditampilkan
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={settings.maxItems}
            onChange={(e) => handleChange("maxItems", parseInt(e.target.value, 10) || 4)}
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-text-primary">
            <input
              type="checkbox"
              checked={settings.showSubject}
              onChange={(e) => handleChange("showSubject", e.target.checked)}
              className="rounded border-border text-brand-600 focus:ring-brand-500"
            />
            <span className="font-medium">Tampilkan Nama Mata Kuliah</span>
          </label>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-text-primary">
            <input
              type="checkbox"
              checked={settings.showDeadline}
              onChange={(e) => handleChange("showDeadline", e.target.checked)}
              className="rounded border-border text-brand-600 focus:ring-brand-500"
            />
            <span className="font-medium">Tampilkan Tenggat Waktu</span>
          </label>
        </div>
      </div>
    </div>
  );
}
