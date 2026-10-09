"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  HomepageConfig,
  HomepageMeta,
  SectionConfig,
  SectionKey,
} from "@/lib/homepage/types";
import {
  saveHomepageDraftAction,
  publishHomepageAction,
  resetSectionAction,
  resetLayoutAction,
  resetAllHomepageAction,
} from "@/lib/actions/homepage";
import { SectionList } from "./section-list";
import { SectionEditor } from "./section-editor";
import { PublishDialog } from "./publish-dialog";
import { ResetDialog, ResetMode } from "./reset-dialog";
import {
  Save,
  Send,
  Eye,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Layers,
} from "lucide-react";

interface HomepageBuilderProps {
  initialConfig: HomepageConfig;
  initialMeta: HomepageMeta;
}

export function HomepageBuilder({ initialConfig, initialMeta }: HomepageBuilderProps) {
  const [config, setConfig] = useState<HomepageConfig>(initialConfig);
  const [meta, setMeta] = useState<HomepageMeta>(initialMeta);
  const [selectedKey, setSelectedKey] = useState<SectionKey>("hero");
  const [mobileTab, setMobileTab] = useState<"list" | "editor">("list");

  // Track unsaved changes in local state
  const [savedJson, setSavedJson] = useState<string>(JSON.stringify(initialConfig));
  const hasUnsavedChanges = JSON.stringify(config) !== savedJson;

  // Dialog states
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [resetDialogState, setResetDialogState] = useState<{
    isOpen: boolean;
    mode: ResetMode;
    targetSectionKey?: SectionKey;
  }>({
    isOpen: false,
    mode: "section",
  });

  // Action status message
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Warn before leaving if unsaved changes exist
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Section updating handler
  function handleUpdateSettings(key: SectionKey, updatedSettings: SectionConfig["settings"]) {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.key === key) {
          return {
            ...s,
            settings: updatedSettings,
          };
        }
        return s;
      }),
    }));
  }

  // Toggle section visibility
  function handleToggleVisibility(key: SectionKey) {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.key === key) {
          return {
            ...s,
            visible: !s.visible,
          };
        }
        return s;
      }),
    }));
  }

  // Reorder sections
  function handleReorder(newOrder: SectionConfig[]) {
    setConfig((prev) => ({
      ...prev,
      sections: newOrder,
    }));
  }

  // Save Draft action
  function handleSaveDraft() {
    setAlertMessage(null);
    startTransition(async () => {
      const res = await saveHomepageDraftAction(config);
      if (res.success && res.config) {
        setConfig(res.config);
        setSavedJson(JSON.stringify(res.config));
        setMeta((prev) => ({
          ...prev,
          draftVersion: prev.draftVersion + 1,
          hasUnpublishedChanges: true,
        }));
        setAlertMessage({
          type: "success",
          text: "Draft berhasil disimpan di database. Perubahan siap dipratinjau sebelum dipublikasikan.",
        });
      } else {
        setAlertMessage({
          type: "error",
          text: res.error || "Gagal menyimpan draft homepage.",
        });
      }
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Publish action
  function handlePublishConfirm() {
    setAlertMessage(null);
    startTransition(async () => {
      const res = await publishHomepageAction(config);
      setIsPublishDialogOpen(false);

      if (res.success) {
        if (res.config) {
          setConfig(res.config);
          setSavedJson(JSON.stringify(res.config));
        } else {
          setSavedJson(JSON.stringify(config));
        }

        setMeta((prev) => ({
          ...prev,
          draftVersion: prev.draftVersion + 1,
          publishedVersion: prev.publishedVersion + 1,
          publishedAt: new Date().toISOString(),
          hasUnpublishedChanges: false,
        }));
        setAlertMessage({
          type: "success",
          text: "Homepage berhasil dipublikasikan! Halaman publik (/) kini menampilkan susunan dan konten terbaru secara instan.",
        });
      } else {
        setAlertMessage({
          type: "error",
          text: res.error || "Tidak dapat mempublikasikan homepage. Periksa kembali form pengaturan section.",
        });
      }
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Reset actions
  function handleTriggerResetSection(key: SectionKey) {
    setResetDialogState({
      isOpen: true,
      mode: "section",
      targetSectionKey: key,
    });
  }

  function handleTriggerResetLayout() {
    setResetDialogState({
      isOpen: true,
      mode: "layout",
    });
  }

  function handleTriggerResetAll() {
    setResetDialogState({
      isOpen: true,
      mode: "all",
    });
  }

  function handleConfirmReset() {
    startTransition(async () => {
      if (resetDialogState.mode === "section" && resetDialogState.targetSectionKey) {
        const key = resetDialogState.targetSectionKey;
        const res = await resetSectionAction(key);
        setResetDialogState({ isOpen: false, mode: "section" });

        if (res.success && res.config) {
          setConfig(res.config);
          setSavedJson(JSON.stringify(res.config));
          setAlertMessage({
            type: "success",
            text: `Section ${key} berhasil dikembalikan ke pengaturan awal.`,
          });
        } else {
          setAlertMessage({ type: "error", text: res.error || "Gagal me-reset section." });
        }
      } else if (resetDialogState.mode === "layout") {
        const res = await resetLayoutAction();
        setResetDialogState({ isOpen: false, mode: "layout" });

        if (res.success && res.config) {
          setConfig(res.config);
          setSavedJson(JSON.stringify(res.config));
          setAlertMessage({
            type: "success",
            text: "Tata letak dan urutan section berhasil dikembalikan ke default. Konten kustom Anda tetap utuh.",
          });
        } else {
          setAlertMessage({ type: "error", text: res.error || "Gagal me-reset layout." });
        }
      } else if (resetDialogState.mode === "all") {
        const res = await resetAllHomepageAction();
        setResetDialogState({ isOpen: false, mode: "all" });

        if (res.success && res.config) {
          setConfig(res.config);
          setSavedJson(JSON.stringify(res.config));
          setAlertMessage({
            type: "success",
            text: "Seluruh konfigurasi homepage berhasil dikembalikan ke pengaturan default.",
          });
        } else {
          setAlertMessage({ type: "error", text: res.error || "Gagal me-reset homepage." });
        }
      }
    });
  }

  const selectedSection = config.sections.find((s) => s.key === selectedKey) || config.sections[0];
  const activeSectionsCount = config.sections.filter((s) => s.visible).length;

  return (
    <div className="space-y-6">
      {/* ── TOP ACTION BAR & STATUS ─────────────────────────────────── */}
      <div className="card p-4 sm:p-5 border border-border bg-card shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              Draft v{meta.draftVersion}
            </span>
            <span className="text-xs font-mono text-text-muted">
              Live v{meta.publishedVersion}
            </span>

            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Ada Perubahan Belum Disimpan</span>
              </span>
            ) : meta.hasUnpublishedChanges ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Draft Belum Dipublikasikan</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle size={12} />
                <span>Homepage Sinkron dengan Live</span>
              </span>
            )}
          </div>

          <p className="text-xs text-text-secondary">
            {activeSectionsCount} dari {config.sections.length} section aktif ditampilkan di homepage.
          </p>
        </div>

        {/* Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reset Dropdown Actions */}
          <div className="flex items-center gap-1.5 mr-1 border-r border-border pr-2">
            <button
              type="button"
              onClick={handleTriggerResetLayout}
              disabled={isPending}
              className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 text-text-secondary hover:text-text-primary"
              title="Reset urutan dan status tampil tanpa menghapus teks kustom"
            >
              <RotateCcw size={13} />
              <span>Reset Layout</span>
            </button>
            <button
              type="button"
              onClick={handleTriggerResetAll}
              disabled={isPending}
              className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:border-red-500/30"
              title="Reset seluruh konfigurasi homepage ke default"
            >
              <RotateCcw size={13} />
              <span>Reset All</span>
            </button>
          </div>

          {/* Preview Button */}
          <Link
            href="/admin/homepage-builder/preview"
            target="_blank"
            className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400"
            title="Pratinjau tampilan homepage dengan konfigurasi draft saat ini"
          >
            <Eye size={14} />
            <span>Pratinjau Draft</span>
            <ExternalLink size={12} className="opacity-60" />
          </Link>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending || !hasUnsavedChanges}
            className={`btn btn-secondary btn-sm flex items-center gap-1.5 text-xs ${
              hasUnsavedChanges
                ? "border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 shadow-xs"
                : "opacity-60"
            }`}
          >
            {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>Simpan Draft</span>
          </button>

          {/* Publish Button */}
          <button
            type="button"
            onClick={() => setIsPublishDialogOpen(true)}
            disabled={isPending}
            className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Send size={13} />
            <span>Publikasikan Live</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
            alertMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
          }`}
        >
          {alertMessage.type === "success" ? (
            <CheckCircle className="text-emerald-500 shrink-0" size={18} />
          ) : (
            <AlertCircle className="text-red-500 shrink-0" size={18} />
          )}
          <span className="font-medium flex-1 text-xs sm:text-sm">{alertMessage.text}</span>
          <button
            type="button"
            onClick={() => setAlertMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden p-1 bg-surface-muted rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mobileTab === "list"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          Susunan Section ({config.sections.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mobileTab === "editor"
              ? "bg-brand-500 text-white shadow-xs"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          Edit: {selectedSection?.label}
        </button>
      </div>

      {/* ── MAIN TWO-PANEL WORKSPACE ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Section List & Reordering */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobileTab === "editor" ? "hidden sm:block" : "block"
          }`}
        >
          <div className="card p-4 sm:p-5 border border-border bg-card shadow-xs">
            <SectionList
              sections={config.sections}
              selectedKey={selectedKey}
              onSelectSection={(key) => {
                setSelectedKey(key);
                setMobileTab("editor");
              }}
              onToggleVisibility={handleToggleVisibility}
              onReorder={handleReorder}
              onResetSection={handleTriggerResetSection}
            />
          </div>
        </div>

        {/* Right Panel: Active Section Editor */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileTab === "list" ? "hidden sm:block" : "block"
          }`}
        >
          {selectedSection ? (
            <SectionEditor
              section={selectedSection}
              onUpdateSettings={handleUpdateSettings}
              onResetSection={handleTriggerResetSection}
              isResetting={isPending}
            />
          ) : (
            <div className="card p-12 text-center border border-border bg-card text-text-muted">
              <Layers size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">Pilih salah satu section di panel kiri untuk mulai mengedit.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <PublishDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        onConfirm={handlePublishConfirm}
        isPublishing={isPending}
        activeSectionsCount={activeSectionsCount}
        totalSectionsCount={config.sections.length}
      />

      <ResetDialog
        isOpen={resetDialogState.isOpen}
        mode={resetDialogState.mode}
        targetSectionKey={resetDialogState.targetSectionKey}
        targetSectionLabel={
          resetDialogState.targetSectionKey
            ? config.sections.find((s) => s.key === resetDialogState.targetSectionKey)?.label
            : undefined
        }
        onClose={() => setResetDialogState({ isOpen: false, mode: "section" })}
        onConfirm={handleConfirmReset}
        isResetting={isPending}
      />
    </div>
  );
}
