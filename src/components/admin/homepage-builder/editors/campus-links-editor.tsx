"use client";

import React from "react";
import { CampusLinksSettings, CampusLinkItem } from "@/lib/homepage/types";
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

interface CampusLinksEditorProps {
  settings: CampusLinksSettings;
  onChange: (updated: CampusLinksSettings) => void;
}

export function CampusLinksEditor({ settings, onChange }: CampusLinksEditorProps) {
  function handleChange<K extends keyof CampusLinksSettings>(field: K, value: CampusLinksSettings[K]) {
    onChange({
      ...settings,
      [field]: value,
    });
  }

  function handleAddLink() {
    const newLink: CampusLinkItem = {
      id: `link-${Date.now()}`,
      name: "Layanan Kampus Baru",
      description: "Deskripsi singkat layanan kampus...",
      url: "https://telkomuniversity.ac.id",
      badge: "Layanan",
      iconKey: "general",
      visible: true,
    };
    onChange({
      ...settings,
      links: [...settings.links, newLink],
    });
  }

  function handleUpdateLink(index: number, field: keyof CampusLinkItem, value: CampusLinkItem[keyof CampusLinkItem]) {
    const updated = [...settings.links];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange({
      ...settings,
      links: updated,
    });
  }

  function handleRemoveLink(index: number) {
    onChange({
      ...settings,
      links: settings.links.filter((_, idx) => idx !== index),
    });
  }

  function handleMoveLink(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.links.length) return;

    const updated = [...settings.links];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    onChange({
      ...settings,
      links: updated,
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
            placeholder="Akses Cepat Kampus"
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-primary mb-1 block">
            Deskripsi Section
          </label>
          <input
            type="text"
            value={settings.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Tautan langsung menuju layanan akademik resmi..."
            className="form-input text-xs w-full bg-surface border-border text-text-primary"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
              Daftar Tautan Kampus ({settings.links.length})
            </h4>
            <p className="text-[11px] text-text-muted mt-0.5">
              Atur urutan, visibilitas, dan URL tujuan masing-masing portal kampus.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddLink}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
          >
            <Plus size={14} />
            <span>Tambah Tautan</span>
          </button>
        </div>

        <div className="space-y-3">
          {settings.links.map((link, idx) => (
            <div
              key={link.id || idx}
              className="p-4 rounded-xl border border-border bg-surface space-y-3"
            >
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 font-mono">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-text-primary">{link.name || "Tautan"}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-muted text-text-muted border border-border">
                    {link.badge}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Up / Down buttons */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveLink(idx, "up")}
                    className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-30"
                    title="Pindahkan ke atas"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === settings.links.length - 1}
                    onClick={() => handleMoveLink(idx, "down")}
                    className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-30"
                    title="Pindahkan ke bawah"
                  >
                    <ArrowDown size={14} />
                  </button>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-text-secondary ml-2">
                    <input
                      type="checkbox"
                      checked={link.visible}
                      onChange={(e) => handleUpdateLink(idx, "visible", e.target.checked)}
                      className="rounded border-border text-brand-600 focus:ring-brand-500"
                    />
                    <span>Tampil</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10 ml-2"
                    title="Hapus tautan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-text-primary mb-1 block">Nama Layanan *</label>
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => handleUpdateLink(idx, "name", e.target.value)}
                    placeholder="Contoh: MyTelU"
                    className="form-input text-xs w-full bg-card border-border text-text-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-primary mb-1 block">Badge Label</label>
                  <input
                    type="text"
                    value={link.badge}
                    onChange={(e) => handleUpdateLink(idx, "badge", e.target.value)}
                    placeholder="Contoh: SSO"
                    className="form-input text-xs w-full bg-card border-border text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-primary mb-1 block">Pilihan Ikon</label>
                  <select
                    value={link.iconKey}
                    onChange={(e) => handleUpdateLink(idx, "iconKey", e.target.value)}
                    className="form-select text-xs w-full bg-card border-border text-text-primary"
                  >
                    <option value="mytelu">MyTelU (Utilitas Telkom)</option>
                    <option value="lms">LMS CeLOE (Pembelajaran)</option>
                    <option value="igracias">iGracias (Akademik)</option>
                    <option value="general">Umum / Tautan Kampus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-text-primary mb-1 block">URL Tujuan *</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleUpdateLink(idx, "url", e.target.value)}
                      placeholder="https://satu.telkomuniversity.ac.id"
                      className="form-input text-xs w-full bg-card border-border text-text-primary pr-8"
                      required
                    />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      title="Tes tautan"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-primary mb-1 block">Deskripsi Layanan</label>
                  <input
                    type="text"
                    value={link.description}
                    onChange={(e) => handleUpdateLink(idx, "description", e.target.value)}
                    placeholder="Uraian singkat fungsi layanan..."
                    className="form-input text-xs w-full bg-card border-border text-text-primary"
                  />
                </div>
              </div>
            </div>
          ))}

          {settings.links.length === 0 && (
            <p className="text-xs text-text-muted text-center py-4 border border-dashed border-border rounded-xl">
              Belum ada tautan kampus yang ditambahkan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
