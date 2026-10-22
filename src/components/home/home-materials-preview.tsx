"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArticleCard } from "@/components/learning/article-card";
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

export interface HomeArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  readingTime?: number | null;
  isFeatured?: boolean;
  tags?: string | null;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
  subject?: {
    code: string;
    name: string;
    color?: string | null;
  } | null;
  author?: {
    name: string;
    role?: string;
  } | null;
}

export interface HomeMaterialsPreviewProps {
  articles?: HomeArticleItem[];
  materials?: HomeMaterialItem[];
  totalCount?: number;
  settings?: MaterialsSettings;
  className?: string;
}

export function HomeMaterialsPreview({
  articles = [],
  materials = [],
  totalCount = 0,
  settings,
  className,
}: HomeMaterialsPreviewProps) {
  const max = settings?.maxItems ?? 3;
  const hasArticles = articles && articles.length > 0;
  const displayArticles = articles.slice(0, max);
  const displayMaterials = materials.slice(0, max);

  const title = settings?.title || "Artikel & Materi Pembelajaran Terbaru";
  const defaultDesc =
    totalCount > 0
      ? `${totalCount} artikel & materi pembelajaran tersedia untuk dipelajari.`
      : "Artikel edukatif, ringkasan perkuliahan, dan panduan belajar kelas JS1SI-26-REG-05.";
  const description = settings?.description || defaultDesc;
  const buttonLabel = settings?.buttonText || "Lihat Semua Artikel";

  return (
    <section className={cn("space-y-6 text-left", className)}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-cyan-400 font-bold">
              {"// Artikel & Materi"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight font-display">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        <Link href="/articles" className="shrink-0">
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

      {/* Content Rendering: Articles or Materials or Empty State */}
      {hasArticles ? (
        <div
          className={cn(
            "grid gap-5",
            displayArticles.length === 1
              ? "grid-cols-1 max-w-md"
              : displayArticles.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-4xl"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {displayArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              className="h-full shadow-xs hover:shadow-md transition-shadow"
            />
          ))}
        </div>
      ) : displayMaterials.length > 0 ? (
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
              href="/articles"
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
      ) : (
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
                  Artikel &amp; Materi Belum Dipublikasikan
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
                  Artikel perkuliahan, modul, dan bahan ajar yang dipublikasikan akan ditampilkan di sini secara otomatis.
                </p>
              </div>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs pointer-events-none group-hover:bg-blue-50 dark:group-hover:bg-cyan-500/10"
                  rightIcon={<ArrowRight size={13} />}
                >
                  Buka Repositori Artikel &amp; Materi
                </Button>
              </div>
            </Link>
          </Card>
        </div>
      )}
    </section>
  );
}
