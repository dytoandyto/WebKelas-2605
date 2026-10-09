"use client";

import React from "react";
import { ScheduleSettings } from "@/lib/homepage/types";

interface ScheduleEditorProps {
  settings: ScheduleSettings;
  onChange: (updated: ScheduleSettings) => void;
}

export function ScheduleEditor({ settings, onChange }: ScheduleEditorProps) {
  function handleChange<K extends keyof ScheduleSettings>(field: K, value: ScheduleSettings[K]) {
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
            placeholder="Jadwal Kuliah Hari Ini"
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
            placeholder="Lihat Jadwal Lengkap"
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
          placeholder="Agenda perkuliahan yang terjadwal untuk hari ini..."
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Maksimal Jadwal Ditampilkan
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={settings.maxItems}
            onChange={(e) => handleChange("maxItems", parseInt(e.target.value, 10) || 5)}
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-text-primary">
            <input
              type="checkbox"
              checked={settings.showRoom}
              onChange={(e) => handleChange("showRoom", e.target.checked)}
              className="rounded border-border text-brand-600 focus:ring-brand-500"
            />
            <span className="font-medium">Tampilkan Ruangan Kelas</span>
          </label>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-text-primary">
            <input
              type="checkbox"
              checked={settings.showLecturer}
              onChange={(e) => handleChange("showLecturer", e.target.checked)}
              className="rounded border-border text-brand-600 focus:ring-brand-500"
            />
            <span className="font-medium">Tampilkan Nama Dosen</span>
          </label>
        </div>
      </div>
    </div>
  );
}
