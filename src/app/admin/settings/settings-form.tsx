"use client";

import React, { useState, useTransition } from "react";
import {
  Save,
  CheckCircle,
  Loader2,
  GraduationCap,
  Globe,
  Mail,
  Building,
  UserCheck,
  BookOpen,
  ImageIcon,
} from "lucide-react";
import { updateSettingsAction } from "@/lib/actions/settings";
import { GithubIcon, InstagramIcon, DiscordIcon, LinkedinIcon } from "@/components/icons";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    className: initialSettings.className || "JS1SI-26-REG-05",
    classShortName: initialSettings.classShortName || "SI • 26-05",
    classCode: initialSettings.classCode || "JS1SI-26-REG-05",
    institutionName: initialSettings.institutionName || "Telkom University Jakarta",
    campusName: initialSettings.campusName || "Telkom University Jakarta",
    studyProgram: initialSettings.studyProgram || "S1 Sistem Informasi",
    academicYear: initialSettings.academicYear || "2026/2027",
    semester: initialSettings.semester || "Semester Ganjil 2026/2027",
    waliDosen: initialSettings.waliDosen || "Muhammad Ardiansyah",
    classHeadline: initialSettings.classHeadline || "LEARN. BUILD. GROW. TOGETHER.",
    classMotto: initialSettings.classMotto || "Innovate, Build, and Elevate Together",
    classDescription: initialSettings.classDescription || "Hub akademik dan portal kelas S1 Sistem Informasi Telkom University Jakarta.",
    logoUrl: initialSettings.logoUrl || "",
    heroImageUrl: initialSettings.heroImageUrl || "",
    contactEmail: initialSettings.contactEmail || "",
    githubUrl: initialSettings.githubUrl || "",
    linkedinUrl: initialSettings.linkedinUrl || "",
    instagramUrl: initialSettings.instagramUrl || "",
    discordUrl: initialSettings.discordUrl || "",
  });

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const res = await updateSettingsAction(formData);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Class configuration saved successfully! Public pages are updated.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to update settings.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
          }`}
        >
          {statusMessage.type === "success" && (
            <CheckCircle className="text-emerald-500 shrink-0" size={18} />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Section 1: Institution & Academic Program */}
      <div className="card p-6 border border-border bg-card shadow-xs space-y-4">
        <div className="pb-3.5 border-b border-border space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Building size={16} />
            </div>
            <h3 className="text-base font-bold text-text-primary leading-none">Institution & Faculty Identity</h3>
          </div>
          <p className="text-xs text-text-muted pl-[38px]">
            Campus, institution, and study program naming.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Institution Name *</label>
            <input
              type="text"
              value={formData.institutionName}
              onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary"
              required
            />
          </div>

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Campus Location / Name</label>
            <input
              type="text"
              value={formData.campusName}
              onChange={(e) => setFormData({ ...formData, campusName: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Study Program (Program Studi) *</label>
            <input
              type="text"
              value={formData.studyProgram}
              onChange={(e) => setFormData({ ...formData, studyProgram: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary"
              required
            />
          </div>

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Class Advisor (Wali Dosen) *</label>
            <input
              type="text"
              value={formData.waliDosen}
              onChange={(e) => setFormData({ ...formData, waliDosen: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 2: Class Cohort Identity */}
      <div className="card p-6 border border-border bg-card shadow-xs space-y-4">
        <div className="pb-3.5 border-b border-border space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <GraduationCap size={16} />
            </div>
            <h3 className="text-base font-bold text-text-primary leading-none">Class Cohort & Period</h3>
          </div>
          <p className="text-xs text-text-muted pl-[38px]">
            Class identifier, academic period, and public branding slogans.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Class Name / Code *</label>
            <input
              type="text"
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value, classCode: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary font-mono"
              required
            />
          </div>

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Short Display Code *</label>
            <input
              type="text"
              placeholder="e.g. SI • 26-05"
              value={formData.classShortName}
              onChange={(e) => setFormData({ ...formData, classShortName: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary font-mono"
              required
            />
          </div>

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Academic Year *</label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Academic Semester Period *</label>
            <input
              type="text"
              placeholder="e.g. Semester Ganjil 2026/2027"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary"
              required
            />
          </div>

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Hero Headline</label>
            <input
              type="text"
              value={formData.classHeadline}
              onChange={(e) => setFormData({ ...formData, classHeadline: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Class Motto / Tagline</label>
          <input
            type="text"
            value={formData.classMotto}
            onChange={(e) => setFormData({ ...formData, classMotto: e.target.value })}
            className="form-input text-sm w-full bg-surface border-border text-text-primary"
          />
        </div>

        <div>
          <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Class Overview Description</label>
          <textarea
            placeholder="Introduce the cohort, learning focus, and class objectives..."
            value={formData.classDescription}
            onChange={(e) =>
              setFormData({ ...formData, classDescription: e.target.value })
            }
            className="form-textarea text-sm w-full bg-surface border-border text-text-primary"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-2">
              <ImageIcon size={14} className="text-text-muted shrink-0" />
              <span>Logo Image URL</span>
            </label>
            <div className="flex items-center gap-2.5">
              {formData.logoUrl ? (
                <div className="w-8 h-8 rounded-lg border border-border bg-surface p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              ) : null}
              <input
                type="url"
                placeholder="https://..."
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="form-input text-xs w-full bg-surface border-border text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-2">
              <ImageIcon size={14} className="text-text-muted shrink-0" />
              <span>Hero Banner Image URL</span>
            </label>
            <div className="flex items-center gap-2.5">
              {formData.heroImageUrl ? (
                <div className="w-8 h-8 rounded-lg border border-border bg-surface p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.heroImageUrl}
                    alt="Hero"
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              ) : null}
              <input
                type="url"
                placeholder="https://..."
                value={formData.heroImageUrl}
                onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                className="form-input text-xs w-full bg-surface border-border text-text-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Contact & Social Channels */}
      <div className="card p-6 border border-border bg-card shadow-xs space-y-4">
        <div className="pb-3.5 border-b border-border space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Globe size={16} />
            </div>
            <h3 className="text-base font-bold text-text-primary leading-none">Contact & Social Channels</h3>
          </div>
          <p className="text-xs text-text-muted pl-[38px]">
            Direct community and contact links shown in the site footer.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-2">
            <Mail size={14} className="text-text-muted shrink-0" />
            <span>Official Contact Email</span>
          </label>
          <input
            type="email"
            placeholder="class.hub@student.telkomuniversity.ac.id"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="form-input text-sm w-full bg-surface border-border text-text-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-2">
              <GithubIcon size={14} className="text-text-muted shrink-0" />
              <span>GitHub Org</span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/..."
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="form-input text-xs w-full bg-surface border-border text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-2">
              <LinkedinIcon size={14} className="text-text-muted shrink-0" />
              <span>LinkedIn Page</span>
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/..."
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="form-input text-xs w-full bg-surface border-border text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-2">
              <InstagramIcon size={14} className="text-text-muted shrink-0" />
              <span>Instagram Profile</span>
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/..."
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              className="form-input text-xs w-full bg-surface border-border text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-2">
              <DiscordIcon size={14} className="text-text-muted shrink-0" />
              <span>Discord Community</span>
            </label>
            <input
              type="url"
              placeholder="https://discord.gg/..."
              value={formData.discordUrl}
              onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
              className="form-input text-xs w-full bg-surface border-border text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary text-sm flex items-center gap-2 px-6 py-2.5 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </form>
  );
}

