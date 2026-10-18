"use client";

import * as React from "react";
import {
  ExternalLink,
  FileText,
  Link as LinkIcon,
  BookMarked,
  FolderOpen,
  Download,
  Layers,
} from "lucide-react";
import { cn, getGoogleDriveViewUrl } from "@/lib/utils";
import { ResourceCategory } from "@prisma/client";

export interface LearningResourceCardProps {
  resource: {
    id: string;
    title: string;
    description?: string | null;
    url: string;
    category: ResourceCategory | string;
    subject?: {
      code: string;
      name: string;
    } | null;
    creator?: {
      name: string;
    } | null;
  };
  className?: string;
}

const CATEGORY_META: Record<string, { label: string; badgeClass: string; icon: any }> = {
  ACADEMIC: {
    label: "Akademik & Modul",
    badgeClass: "bg-cyan-500/15 text-cyan-300 light:bg-blue-50 light:text-blue-700 border-cyan-500/30 light:border-blue-200",
    icon: BookMarked,
  },
  CLASS: {
    label: "Tautan Kelas",
    badgeClass: "bg-purple-500/15 text-purple-300 light:bg-purple-50 light:text-purple-700 border-purple-500/30 light:border-purple-200",
    icon: FolderOpen,
  },
  REFERENCE: {
    label: "Referensi Bacaan",
    badgeClass: "bg-emerald-500/15 text-emerald-300 light:bg-emerald-50 light:text-emerald-700 border-emerald-500/30 light:border-emerald-200",
    icon: FileText,
  },
  IMPORTANT_LINK: {
    label: "Portal Kampus",
    badgeClass: "bg-amber-500/15 text-amber-300 light:bg-amber-50 light:text-amber-700 border-amber-500/30 light:border-amber-200",
    icon: LinkIcon,
  },
  OTHER: {
    label: "Berkas / Lainnya",
    badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
    icon: Layers,
  },
};

export function LearningResourceCard({ resource, className }: LearningResourceCardProps) {
  const meta = CATEGORY_META[resource.category] || CATEGORY_META.OTHER;
  const CategoryIcon = meta.icon;

  const directUrl = getGoogleDriveViewUrl(resource.url) || resource.url;
  const isGoogleDrive = resource.url.includes("drive.google.com");
  const isPdf = resource.url.toLowerCase().endsWith(".pdf") || resource.title.toLowerCase().includes("pdf");

  return (
    <div
      className={cn(
        "group flex flex-col justify-between rounded-2xl border border-cyan-500/20 light:border-slate-200 bg-[#08152e]/80 light:bg-white p-5 shadow-[0_0_15px_rgba(6,182,212,0.06)] hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] transition-all duration-200",
        className
      )}
    >
      <div className="space-y-3">
        {/* Category & Subject Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={cn("px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold border flex items-center gap-1.5", meta.badgeClass)}>
            <CategoryIcon size={12} />
            {meta.label}
          </span>

          {resource.subject && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-cyan-500/10 text-cyan-300 light:bg-slate-100 light:text-slate-600 border border-cyan-500/20 light:border-slate-200">
              {resource.subject.code}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-white light:text-slate-900 group-hover:text-cyan-300 light:group-hover:text-blue-600 transition-colors font-display line-clamp-2 leading-snug">
          {resource.title}
        </h4>

        {/* Description */}
        {resource.description && (
          <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      {/* Action Footers */}
      <div className="pt-4 mt-4 border-t border-cyan-500/15 light:border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 truncate max-w-[130px] font-mono text-[11px]">
          {resource.creator?.name ? `Oleh ${resource.creator.name}` : "Materi Terverifikasi"}
        </span>

        <div className="flex items-center gap-2">
          {isGoogleDrive && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              title="Download / Buka Google Drive"
            >
              <Download size={14} />
            </a>
          )}
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-400/30 transition-all cursor-pointer"
          >
            <span>{isPdf ? "Buka PDF" : "Buka Tautan"}</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
