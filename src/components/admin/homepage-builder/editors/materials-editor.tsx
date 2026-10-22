"use client";

import React from "react";
import { MaterialsSettings } from "@/lib/homepage/types";

interface MaterialsEditorProps {
  settings: MaterialsSettings;
  onChange: (updated: MaterialsSettings) => void;
}

export function MaterialsEditor({ settings, onChange }: MaterialsEditorProps) {
  function handleChange<K extends keyof MaterialsSettings>(field: K, value: MaterialsSettings[K]) {
    onChange({
      ...settings,
      [field]: value,
    });
  }

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
        Section ini menampilkan kartu pratinjau <strong>Artikel Pembelajaran &amp; Ringkasan Materi</strong> terkini di homepage utama kelas, yang terhubung langsung dengan repositori artikel perkuliahan.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Judul Section
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Artikel & Materi Pembelajaran Terbaru"
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
            placeholder="Lihat Semua Artikel"
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
          placeholder="Artikel edukatif, ringkasan perkuliahan, dan panduan belajar kelas JS1SI-26-REG-05..."
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>

      <div className="pt-4 border-t border-border max-w-xs">
        <label className="text-xs font-semibold text-text-primary mb-1 block">
          Maksimal Artikel Ditampilkan
        </label>
        <input
          type="number"
          min={1}
          max={12}
          value={settings.maxItems}
          onChange={(e) => handleChange("maxItems", parseInt(e.target.value, 10) || 3)}
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
        <p className="text-[11px] text-text-muted mt-1">
          Rekomendasi: 3 artikel untuk tampilan grid 3 kolom yang rapi.
        </p>
      </div>
    </div>
  );
}
