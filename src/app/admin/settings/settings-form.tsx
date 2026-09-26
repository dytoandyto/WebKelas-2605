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
} from "lucide-react";
import { updateSettingsAction } from "@/lib/actions/settings";
import { GithubIcon, InstagramIcon, DiscordIcon, LinkedinIcon } from "@/components/icons";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    className: initialSettings.className || "Informatics Class 2026",
    institutionName: initialSettings.institutionName || "",
    academicYear: initialSettings.academicYear || "2026/2027",
    classMotto: initialSettings.classMotto || "",
    classDescription: initialSettings.classDescription || "",
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
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {statusMessage.type === "success" && (
            <CheckCircle className="text-emerald-500 flex-shrink-0" size={18} />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Section 1: General Class Profile */}
      <div className="card p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <GraduationCap size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Class Identity</h3>
            <p className="text-xs text-slate-500">
              Basic identification displayed across website header, hero banners, and footers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Class Name *</label>
            <input
              type="text"
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
          </div>

          <div>
            <label className="form-label">Institution / Faculty</label>
            <input
              type="text"
              placeholder="e.g. Faculty of Computer Science, Universitas Indonesia"
              value={formData.institutionName}
              onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
              className="form-input text-sm w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Academic Year *</label>
            <input
              type="text"
              placeholder="e.g. 2026/2027"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
          </div>

          <div>
            <label className="form-label">Class Motto / Tagline</label>
            <input
              type="text"
              placeholder="e.g. Innovate, Build, and Elevate Together"
              value={formData.classMotto}
              onChange={(e) => setFormData({ ...formData, classMotto: e.target.value })}
              className="form-input text-sm w-full"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Class Overview Description</label>
          <textarea
            placeholder="Introduce the cohort, learning focus, and class objectives..."
            value={formData.classDescription}
            onChange={(e) =>
              setFormData({ ...formData, classDescription: e.target.value })
            }
            className="form-textarea text-sm w-full"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="form-label">Logo Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="form-input text-xs w-full"
            />
          </div>

          <div>
            <label className="form-label">Hero Banner Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.heroImageUrl}
              onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
              className="form-input text-xs w-full"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Contact & Social Channels */}
      <div className="card p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Contact & Social Channels</h3>
            <p className="text-xs text-slate-500">
              Direct community and contact links shown in the site footer.
            </p>
          </div>
        </div>

        <div>
          <label className="form-label flex items-center gap-1.5">
            <Mail size={13} className="text-slate-400" />
            Official Contact Email
          </label>
          <input
            type="email"
            placeholder="contact@classhub.edu"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="form-input text-sm w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="form-label flex items-center gap-1.5">
              <GithubIcon size={13} className="text-slate-500" />
              GitHub Org
            </label>
            <input
              type="url"
              placeholder="https://github.com/..."
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="form-input text-xs w-full"
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-1.5">
              <LinkedinIcon size={13} className="text-slate-500" />
              LinkedIn Page
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/..."
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="form-input text-xs w-full"
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-1.5">
              <InstagramIcon size={13} className="text-slate-500" />
              Instagram Profile
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/..."
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              className="form-input text-xs w-full"
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-1.5">
              <DiscordIcon size={13} className="text-slate-500" />
              Discord Community
            </label>
            <input
              type="url"
              placeholder="https://discord.gg/..."
              value={formData.discordUrl}
              onChange={(e) => setFormData({ ...formData, discordUrl: e.target.value })}
              className="form-input text-xs w-full"
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
