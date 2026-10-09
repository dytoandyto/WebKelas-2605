"use client";

import React from "react";
import { HeroSettings } from "@/lib/homepage/types";

interface HeroEditorProps {
  settings: HeroSettings;
  onChange: (updated: HeroSettings) => void;
}

export function HeroEditor({ settings, onChange }: HeroEditorProps) {
  function handleChange<K extends keyof HeroSettings>(field: K, value: HeroSettings[K]) {
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
            Label Kecil (Eyebrow)
          </label>
          <input
            type="text"
            value={settings.eyebrow}
            onChange={(e) => handleChange("eyebrow", e.target.value)}
            placeholder="Ruang Digital Kelas"
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Tahun / Periode Akademik
          </label>
          <input
            type="text"
            value={settings.academicYear}
            onChange={(e) => handleChange("academicYear", e.target.value)}
            placeholder="Semester Ganjil 2026/2027"
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Judul Utama (Kode Kelas) *
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="JS1SI-26-REG-05"
            className="form-input text-xs w-full bg-surface border-border text-text-primary font-mono"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Sub-Judul (Program Studi & Kampus)
          </label>
          <input
            type="text"
            value={settings.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            placeholder="S1 Sistem Informasi • Telkom University Jakarta"
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-text-primary mb-1 block">
          Deskripsi Hero
        </label>
        <textarea
          value={settings.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
          placeholder="Rumah digital dan wadah kolaboratif mahasiswa..."
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
          Tombol Aksi Cepat (Call to Action)
        </h4>

        {/* Primary Button */}
        <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">Tombol Utama</span>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={settings.primaryButtonVisible}
                onChange={(e) => handleChange("primaryButtonVisible", e.target.checked)}
                className="rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <span>Tampilkan</span>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-text-muted mb-1 block">Teks Tombol</label>
              <input
                type="text"
                value={settings.primaryButtonText}
                onChange={(e) => handleChange("primaryButtonText", e.target.value)}
                placeholder="Jadwal Perkuliahan"
                className="form-input text-xs w-full bg-surface border-border text-text-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-text-muted mb-1 block">URL Tujuan</label>
              <input
                type="text"
                value={settings.primaryButtonUrl}
                onChange={(e) => handleChange("primaryButtonUrl", e.target.value)}
                placeholder="/schedule"
                className="form-input text-xs w-full bg-surface border-border text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Secondary Button */}
        <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">Tombol Kedua</span>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={settings.secondaryButtonVisible}
                onChange={(e) => handleChange("secondaryButtonVisible", e.target.checked)}
                className="rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <span>Tampilkan</span>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-text-muted mb-1 block">Teks Tombol</label>
              <input
                type="text"
                value={settings.secondaryButtonText}
                onChange={(e) => handleChange("secondaryButtonText", e.target.value)}
                placeholder="Tugas & Deadline"
                className="form-input text-xs w-full bg-surface border-border text-text-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-text-muted mb-1 block">URL Tujuan</label>
              <input
                type="text"
                value={settings.secondaryButtonUrl}
                onChange={(e) => handleChange("secondaryButtonUrl", e.target.value)}
                placeholder="/tasks"
                className="form-input text-xs w-full bg-surface border-border text-text-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex flex-wrap gap-6 text-xs text-text-primary">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showClassPills}
            onChange={(e) => handleChange("showClassPills", e.target.checked)}
            className="rounded border-border text-brand-600 focus:ring-brand-500"
          />
          <span className="font-medium">Tampilkan Pill Info Wali Dosen & Kelas</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showBadges}
            onChange={(e) => handleChange("showBadges", e.target.checked)}
            className="rounded border-border text-brand-600 focus:ring-brand-500"
          />
          <span className="font-medium">Tampilkan Badge Akademik</span>
        </label>
      </div>
    </div>
  );
}
