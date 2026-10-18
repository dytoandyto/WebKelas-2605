"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { MaterialsSettings } from "@/lib/homepage/types";

export interface HomeMaterialItem {
  id: string;
  title: string;
  type?: string | null;
  description?: string | null;
  fileSize?: string | null;
  subject?: {
    code?: string;
    name?: string;
  } | null;
}

export interface HomeMaterialsPreviewProps {
  materials?: HomeMaterialItem[];
  totalCount?: number;
  settings?: MaterialsSettings;
  className?: string;
}

export function HomeMaterialsPreview({
  materials = [],
  totalCount = 0,
  settings,
  className,
}: HomeMaterialsPreviewProps) {
  const max = settings?.maxItems ?? 3;
  const displayMaterials = materials.slice(0, max);
  const title = settings?.title || "Materi Kuliah";
  const defaultDesc =
    totalCount > 0
      ? `${totalCount} materi tersedia untuk dipelajari.`
      : "Temukan modul dan bahan ajar berdasarkan mata kuliahnya.";
  const description = settings?.description || defaultDesc;
  const buttonLabel = settings?.buttonText || "Lihat Semua Materi";

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-cyan-400 font-bold">
              {"// Bahan Belajar"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        </div>

        <Link href="/articles">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-semibold cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {buttonLabel}
          </Button>
        </Link>
      </div>

      {displayMaterials.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <Card
            variant="interactive"
            padding="md"
            className="text-center border-dashed p-6 sm:p-8 space-y-3"
          >
            <Link href="/articles" className="block space-y-3 group focus-visible:outline-none">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  Materi Perkuliahan Belum Diunggah
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
                  Modul dan bahan ajar dikelompokkan berdasarkan mata kuliah. Akses halaman materi atau artikel untuk memilih topik dan melihat modul yang tersedia.
                </p>
              </div>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs pointer-events-none group-hover:bg-blue-50 dark:group-hover:bg-cyan-500/10"
                  rightIcon={<ArrowRight size={13} />}
                >
                  Buka Repositori Artikel & Materi
                </Button>
              </div>
            </Link>
          </Card>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            displayMaterials.length === 1
              ? "grid-cols-1 max-w-md"
              : displayMaterials.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {displayMaterials.map((m) => (
            <Link
              key={m.id}
              href={`/articles`}
              className="group block h-full focus-visible:outline-none"
            >
              <Card
                variant="interactive"
                padding="md"
                className="h-full p-5 flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/60 dark:hover:border-cyan-400/50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30">
                      {m.type || "PDF"}
                    </span>
                    {m.subject && (
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 truncate">
                        {m.subject.code}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {m.title}
                    </h3>
                    {m.subject?.name && (
                      <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                        {m.subject.name}
                      </p>
                    )}
                  </div>

                  {m.description && (
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border-color)]/70 flex items-center justify-between text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300">
                  <span>Lihat materi →</span>
                  {m.fileSize && (
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {m.fileSize}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
