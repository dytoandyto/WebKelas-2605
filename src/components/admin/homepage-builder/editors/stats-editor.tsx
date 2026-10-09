"use client";

import React from "react";
import { StatsSettings } from "@/lib/homepage/types";
import { Users, BookOpen, CheckSquare, Layers, Trophy, FileText } from "lucide-react";

interface StatsEditorProps {
  settings: StatsSettings;
  onChange: (updated: StatsSettings) => void;
}

export function StatsEditor({ settings, onChange }: StatsEditorProps) {
  function handleChange<K extends keyof StatsSettings>(field: K, value: StatsSettings[K]) {
    onChange({
      ...settings,
      [field]: value,
    });
  }

  function handleToggleCard(cardKey: keyof StatsSettings["visibleCards"]) {
    onChange({
      ...settings,
      visibleCards: {
        ...settings.visibleCards,
        [cardKey]: !settings.visibleCards[cardKey],
      },
    });
  }

  const cardList: Array<{
    key: keyof StatsSettings["visibleCards"];
    label: string;
    desc: string;
    icon: React.ElementType;
  }> = [
    { key: "students", label: "Mahasiswa", desc: "Jumlah rekan mahasiswa yang terdaftar di kelas", icon: Users },
    { key: "subjects", label: "Mata Kuliah", desc: "Jumlah mata kuliah semester ini", icon: BookOpen },
    { key: "tasks", label: "Tugas Aktif", desc: "Jumlah tugas dengan deadline mendatang", icon: CheckSquare },
    { key: "materials", label: "Materi Kuliah", desc: "Total file dan modul materi perkuliahan", icon: Layers },
    { key: "achievements", label: "Prestasi Kelas", desc: "Total prestasi dan penghargaan kelas", icon: Trophy },
    { key: "dailyNotes", label: "Catatan Kelas", desc: "Jumlah rangkuman materi dan jurnal kuliah", icon: FileText },
  ];

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
            placeholder="Aktivitas & Statistik Kelas"
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Deskripsi / Subtitle
          </label>
          <input
            type="text"
            value={settings.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            placeholder="Ringkasan data akademik kelas..."
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
            Pilih Kartu Metrik yang Ditampilkan
          </h4>
          <p className="text-[11px] text-text-muted mt-0.5">
            Angka statistik dihitung otomatis dan akurat secara real-time dari database.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cardList.map((card) => {
            const Icon = card.icon;
            const isChecked = !!settings.visibleCards[card.key];

            return (
              <div
                key={card.key}
                onClick={() => handleToggleCard(card.key)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isChecked
                    ? "bg-brand-500/10 border-brand-500/40 text-text-primary"
                    : "bg-surface-muted/30 border-border opacity-60 text-text-muted hover:opacity-100"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isChecked
                      ? "bg-brand-500 text-white shadow-xs"
                      : "bg-surface-muted text-text-muted"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{card.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent onClick
                      className="rounded border-border text-brand-600 pointer-events-none"
                    />
                  </div>
                  <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
