"use client";

import React from "react";
import { GallerySettings } from "@/lib/homepage/types";

interface GalleryEditorProps {
  settings: GallerySettings;
  onChange: (updated: GallerySettings) => void;
}

export function GalleryEditor({ settings, onChange }: GalleryEditorProps) {
  function handleChange<K extends keyof GallerySettings>(field: K, value: GallerySettings[K]) {
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
            placeholder="Galeri Kegiatan & Momen Kelas"
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
            placeholder="Lihat Semua Foto"
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
          placeholder="Dokumentasi kegiatan akademik, praktikum, dan kebersamaan..."
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>

      <div className="pt-4 border-t border-border max-w-xs">
        <label className="text-xs font-semibold text-text-primary mb-1 block">
          Maksimal Foto Ditampilkan
        </label>
        <input
          type="number"
          min={1}
          max={24}
          value={settings.maxItems}
          onChange={(e) => handleChange("maxItems", parseInt(e.target.value, 10) || 6)}
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>
    </div>
  );
}
