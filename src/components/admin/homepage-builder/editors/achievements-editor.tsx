"use client";

import React from "react";
import { AchievementsSettings } from "@/lib/homepage/types";

interface AchievementsEditorProps {
  settings: AchievementsSettings;
  onChange: (updated: AchievementsSettings) => void;
}

export function AchievementsEditor({ settings, onChange }: AchievementsEditorProps) {
  function handleChange<K extends keyof AchievementsSettings>(field: K, value: AchievementsSettings[K]) {
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
            placeholder="Prestasi & Kebanggaan Kelas"
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
            placeholder="Lihat Semua Prestasi"
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
          placeholder="Apresiasi pencapaian akademik dan kompetisi mahasiswa..."
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Maksimal Prestasi Ditampilkan
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

        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Pilihan Tata Letak (Layout)
          </label>
          <select
            value={settings.layout}
            onChange={(e) => handleChange("layout", e.target.value as "grid" | "compact")}
            className="form-select text-xs w-full bg-surface border-border text-text-primary"
          >
            <option value="grid">Grid Card (Normal)</option>
            <option value="compact">Compact List (Ringkas)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
