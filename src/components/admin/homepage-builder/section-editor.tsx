"use client";

import React from "react";
import {
  SectionConfig,
  SectionKey,
  HeroSettings,
  StatsSettings,
  ScheduleSettings,
  CampusLinksSettings,
  TasksSettings,
  MaterialsSettings,
  AchievementsSettings,
  StudentsSettings,
  GallerySettings,
  DailyNotesSettings,
  AboutSettings,
} from "@/lib/homepage/types";
import { getSectionMeta } from "@/lib/homepage/registry";
import { RotateCcw } from "lucide-react";

import { HeroEditor } from "./editors/hero-editor";
import { StatsEditor } from "./editors/stats-editor";
import { ScheduleEditor } from "./editors/schedule-editor";
import { CampusLinksEditor } from "./editors/campus-links-editor";
import { TasksEditor } from "./editors/tasks-editor";
import { MaterialsEditor } from "./editors/materials-editor";
import { AchievementsEditor } from "./editors/achievements-editor";
import { StudentsEditor } from "./editors/students-editor";
import { GalleryEditor } from "./editors/gallery-editor";
import { DailyNotesEditor } from "./editors/daily-notes-editor";
import { AboutSectionEditor } from "./editors/about-editor";

interface SectionEditorProps {
  section: SectionConfig;
  onUpdateSettings: (key: SectionKey, updatedSettings: SectionConfig["settings"]) => void;
  onResetSection: (key: SectionKey) => void;
  isResetting?: boolean;
}

export function SectionEditor({
  section,
  onUpdateSettings,
  onResetSection,
  isResetting,
}: SectionEditorProps) {
  const meta = getSectionMeta(section.key);
  const Icon = meta.icon;

  function renderEditor() {
    switch (section.key) {
      case "hero":
        return (
          <HeroEditor
            settings={section.settings as HeroSettings}
            onChange={(updated) => onUpdateSettings("hero", updated)}
          />
        );
      case "stats":
        return (
          <StatsEditor
            settings={section.settings as StatsSettings}
            onChange={(updated) => onUpdateSettings("stats", updated)}
          />
        );
      case "today_schedule":
        return (
          <ScheduleEditor
            settings={section.settings as ScheduleSettings}
            onChange={(updated) => onUpdateSettings("today_schedule", updated)}
          />
        );
      case "campus_links":
        return (
          <CampusLinksEditor
            settings={section.settings as CampusLinksSettings}
            onChange={(updated) => onUpdateSettings("campus_links", updated)}
          />
        );
      case "upcoming_tasks":
        return (
          <TasksEditor
            settings={section.settings as TasksSettings}
            onChange={(updated) => onUpdateSettings("upcoming_tasks", updated)}
          />
        );
      case "materials":
        return (
          <MaterialsEditor
            settings={section.settings as MaterialsSettings}
            onChange={(updated) => onUpdateSettings("materials", updated)}
          />
        );
      case "achievements":
        return (
          <AchievementsEditor
            settings={section.settings as AchievementsSettings}
            onChange={(updated) => onUpdateSettings("achievements", updated)}
          />
        );
      case "students":
        return (
          <StudentsEditor
            settings={section.settings as StudentsSettings}
            onChange={(updated) => onUpdateSettings("students", updated)}
          />
        );
      case "gallery":
        return (
          <GalleryEditor
            settings={section.settings as GallerySettings}
            onChange={(updated) => onUpdateSettings("gallery", updated)}
          />
        );
      case "daily_notes":
        return (
          <DailyNotesEditor
            settings={section.settings as DailyNotesSettings}
            onChange={(updated) => onUpdateSettings("daily_notes", updated)}
          />
        );
      case "about":
        return (
          <AboutSectionEditor
            settings={section.settings as AboutSettings}
            onChange={(updated) => onUpdateSettings("about", updated)}
          />
        );
      default:
        return (
          <p className="text-xs text-text-muted">Editor untuk section ini belum tersedia.</p>
        );
    }
  }

  return (
    <div className="card p-6 border border-border bg-card shadow-xs space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${meta.accentColor} flex items-center justify-center text-white shadow-xs shrink-0`}
          >
            <Icon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-text-primary leading-none">
                {section.label}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono font-semibold border border-brand-500/25">
                {meta.badge}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">{meta.description}</p>
          </div>
        </div>

        <button
          type="button"
          disabled={isResetting}
          onClick={() => onResetSection(section.key)}
          className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:border-amber-500/50 self-start sm:self-auto shrink-0"
          title="Kembalikan hanya section ini ke teks default"
        >
          <RotateCcw size={13} />
          <span>Reset Section ke Default</span>
        </button>
      </div>

      {/* Editor Body */}
      <div>{renderEditor()}</div>
    </div>
  );
}
