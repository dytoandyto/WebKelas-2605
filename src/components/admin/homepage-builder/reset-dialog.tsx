"use client";

import React from "react";
import { RotateCcw, AlertTriangle, X, Loader2 } from "lucide-react";
import { SectionKey } from "@/lib/homepage/types";

export type ResetMode = "section" | "layout" | "all";

interface ResetDialogProps {
  isOpen: boolean;
  mode: ResetMode;
  targetSectionKey?: SectionKey;
  targetSectionLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  isResetting: boolean;
}

export function ResetDialog({
  isOpen,
  mode,
  targetSectionLabel,
  onClose,
  onConfirm,
  isResetting,
}: ResetDialogProps) {
  if (!isOpen) return null;

  function getDetails() {
    switch (mode) {
      case "section":
        return {
          title: `Reset Section: ${targetSectionLabel || "Section"}`,
          desc: "Tindakan ini akan mengembalikan teks, opsi, dan pengaturan pada section ini ke nilai bawaan (default).",
          points: [
            "Section lain tidak akan terpengaruh.",
            "Urutan dan posisi section tetap dipertahankan.",
            "Data akademik di database tetap aman dan tidak berubah.",
          ],
          btnText: "Reset Section Ini",
        };
      case "layout":
        return {
          title: "Reset Tata Letak & Urutan Layout",
          desc: "Tindakan ini akan mengembalikan urutan posisi (order) dan status visibilitas seluruh section ke susunan default.",
          points: [
            "Konten kustom (judul, deskripsi, link) pada tiap section TETAP DIPERTAHANKAN.",
            "Hanya urutan posisi dan toggle tampil/sembunyi yang diatur ulang ke preset awal.",
            "Data akademik dan akun pengguna tetap aman.",
          ],
          btnText: "Reset Tata Letak",
        };
      case "all":
        return {
          title: "Reset Seluruh Konfigurasi Homepage ke Default",
          desc: "Tindakan ini akan mengembalikan seluruh teks, urutan section, dan opsi tampilan homepage ke pengaturan pabrik (default).",
          points: [
            "Seluruh kustomisasi draft homepage akan diatur ulang.",
            "Data akademik (jadwal, materi, tugas, mahasiswa, prestasi) TIDAK DIHAPUS.",
            "Halaman Tentang dan akun pengguna tetap utuh.",
          ],
          btnText: "Reset Seluruh Homepage",
        };
    }
  }

  const details = getDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="card max-w-md w-full p-6 border border-border bg-card shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
            <h3 className="text-base font-bold text-text-primary">{details.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-muted"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>{details.desc}</p>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1.5">
            <span className="font-bold block text-[11px] uppercase tracking-wider font-mono">
              Perilaku Sistem:
            </span>
            <ul className="space-y-1 list-disc list-inside text-[11px]">
              {details.points.map((pt, idx) => (
                <li key={idx}>{pt}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="btn btn-secondary btn-sm text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isResetting}
            className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isResetting ? (
              <>
                <Loader2 className="animate-spin" size={13} />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <RotateCcw size={13} />
                <span>{details.btnText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
