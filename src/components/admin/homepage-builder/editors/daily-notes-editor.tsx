"use client";

import React from "react";
import { DailyNotesSettings } from "@/lib/homepage/types";

interface DailyNotesEditorProps {
  settings: DailyNotesSettings;
  onChange: (updated: DailyNotesSettings) => void;
}

export function DailyNotesEditor({ settings, onChange }: DailyNotesEditorProps) {
  function handleChange<K extends keyof DailyNotesSettings>(field: K, value: DailyNotesSettings[K]) {
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
            placeholder="Catatan & Jurnal Perkuliahan"
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
            placeholder="Buka Catatan Kelas"
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
          placeholder="Rangkuman materi harian dan notulensi perkuliahan dari teman sekelas..."
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>

      <div className="pt-4 border-t border-border max-w-xs">
        <label className="text-xs font-semibold text-text-primary mb-1 block">
          Maksimal Catatan Ditampilkan
        </label>
        <input
          type="number"
          min={1}
          max={20}
          value={settings.maxItems}
          onChange={(e) => handleChange("maxItems", parseInt(e.target.value, 10) || 3)}
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>
    </div>
  );
}
