"use client";

import React from "react";
import Link from "next/link";
import { AboutSettings } from "@/lib/homepage/types";
import { ExternalLink, Info } from "lucide-react";

interface AboutEditorProps {
  settings: AboutSettings;
  onChange: (updated: AboutSettings) => void;
}

export function AboutSectionEditor({ settings, onChange }: AboutEditorProps) {
  function handleChange<K extends keyof AboutSettings>(field: K, value: AboutSettings[K]) {
    onChange({
      ...settings,
      [field]: value,
    });
  }

  return (
    <div className="space-y-6">
      {/* Informative Link to Full About Editor */}
      <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info size={16} className="text-brand-500 shrink-0" />
          <span className="text-text-secondary">
            Konten mendalam seperti Visi, Misi, Nilai Utama, dan Pengurus Kelas dikelola terpusat di{" "}
            <strong className="text-text-primary">Halaman Tentang</strong>.
          </span>
        </div>
        <Link
          href="/admin/about"
          className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs shrink-0 self-start sm:self-auto"
        >
          <ExternalLink size={13} />
          <span>Buka Editor /admin/about</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Judul Section Teaser
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Tentang Kelas JS1SI-26-REG-05"
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
            placeholder="Selengkapnya Tentang Kelas"
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-text-primary mb-1 block">
          Deskripsi Teaser
        </label>
        <textarea
          value={settings.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={2}
          placeholder="Sorotan singkat visi kelas, nilai utama, dan identitas kami..."
          className="form-input text-xs w-full bg-surface border-border text-text-primary"
        />
      </div>

      <div className="pt-4 border-t border-border flex flex-wrap gap-6 text-xs text-text-primary">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showVision}
            onChange={(e) => handleChange("showVision", e.target.checked)}
            className="rounded border-border text-brand-600 focus:ring-brand-500"
          />
          <span className="font-medium">Tampilkan Cuplikan Visi Kelas</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showLeaders}
            onChange={(e) => handleChange("showLeaders", e.target.checked)}
            className="rounded border-border text-brand-600 focus:ring-brand-500"
          />
          <span className="font-medium">Tampilkan Cuplikan Pengurus Kelas</span>
        </label>
      </div>
    </div>
  );
}
