"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, BookOpen, ArrowRight, Tag } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export interface ArticleCardProps {
  article: {
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
    _count?: {
      resources?: number;
      notes?: number;
    };
  };
  featuredVariant?: boolean;
  className?: string;
}

export function ArticleCard({ article, featuredVariant = false, className }: ArticleCardProps) {
  const publishedDate = article.publishedAt || article.createdAt;
  const tagsList = article.tags
    ? article.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // Hero Featured Variant
  if (featuredVariant) {
    return (
      <article
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-md transition-all duration-200",
          className
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Cover Image Container */}
          <div className="relative lg:col-span-5 h-64 sm:h-72 lg:h-full min-h-[260px] overflow-hidden bg-slate-100 dark:bg-slate-950">
            {article.coverImage ? (
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
                <BookOpen size={48} className="text-slate-300 dark:text-slate-700" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm">
                Artikel Pilihan
              </span>
            </div>
          </div>

          {/* Content Body */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              {/* Meta & Subject */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {article.subject && (
                  <span className="px-2.5 py-1 rounded-md font-mono text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    {article.subject.code} • {article.subject.name}
                  </span>
                )}
                <span className="text-slate-500 dark:text-slate-400 font-mono">
                  {formatDate(publishedDate)}
                </span>
              </div>

              {/* Title */}
              <Link href={`/articles/${article.slug}`}>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display line-clamp-2 leading-snug">
                  {article.title}
                </h3>
              </Link>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Author & Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold">
                  {article.author?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {article.author?.name || "Tim Akademik"}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {article.author?.role?.replace("_", " ") || "Kontributor"}
                  </p>
                </div>
              </div>

              <Link
                href={`/articles/${article.slug}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                <span>Baca Lengkap</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard Grid Card
  return (
    <article
      className={cn(
        "group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <div>
        {/* Card Cover */}
        <Link
          href={`/articles/${article.slug}`}
          className="block relative h-44 sm:h-48 overflow-hidden bg-slate-100 dark:bg-slate-950"
        >
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
              <BookOpen size={36} className="text-slate-300 dark:text-slate-700" />
            </div>
          )}
          {article.isFeatured && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-600 text-white shadow-xs">
              Pilihan
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            {article.subject && (
              <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                {article.subject.code}
              </span>
            )}
            <span className="font-mono">{formatDate(publishedDate)}</span>
          </div>

          <Link href={`/articles/${article.slug}`}>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display line-clamp-2 leading-snug">
              {article.title}
            </h4>
          </Link>

          {article.excerpt && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tagsList.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] border border-slate-300 dark:border-slate-700">
            {article.author?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <span className="truncate max-w-[130px] font-medium text-slate-700 dark:text-slate-300">
            {article.author?.name || "Tim Akademik"}
          </span>
        </div>

        <Link
          href={`/articles/${article.slug}`}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
        >
          <span>Baca</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
