"use client";

import React from "react";
import { StudentsSettings } from "@/lib/homepage/types";

interface StudentsEditorProps {
  settings: StudentsSettings;
  onChange: (updated: StudentsSettings) => void;
}

export function StudentsEditor({ settings, onChange }: StudentsEditorProps) {
  function handleChange<K extends keyof StudentsSettings>(field: K, value: StudentsSettings[K]) {
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
            placeholder="Teman Satu Kelas"
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
            placeholder="Lihat Semua Mahasiswa"
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
          placeholder="Mengenal rekan mahasiswa angkatan 2026 kelas JS1SI-26-REG-05..."
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Maksimal Mahasiswa Ditampilkan
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={settings.maxItems}
            onChange={(e) => handleChange("maxItems", parseInt(e.target.value, 10) || 8)}
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-text-primary">
            <input
              type="checkbox"
              checked={settings.showMajor}
              onChange={(e) => handleChange("showMajor", e.target.checked)}
              className="rounded border-border text-brand-600 focus:ring-brand-500"
            />
            <span className="font-medium">Tampilkan Program Studi</span>
          </label>
        </div>
      </div>
    </div>
  );
}
