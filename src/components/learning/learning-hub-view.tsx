"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  FileText,
  FolderOpen,
  Filter,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ArticleCard } from "./article-card";
import { StudyNoteCard } from "./study-note-card";
import { LearningResourceCard } from "./learning-resource-card";

export interface LearningHubViewProps {
  initialData: {
    articles: any[];
    featuredArticle: any | null;
    dailyNotes: any[];
    resources: any[];
    subjects: { id: string; code: string; name: string }[];
  };
  initialSubjectCode?: string;
}

type CategoryTab = "all" | "articles" | "notes" | "resources";

export function LearningHubView({ initialData, initialSubjectCode }: LearningHubViewProps) {
  // Resolve initial subject
  const initialSubject = initialSubjectCode
    ? initialData.subjects.find(
        (s) => s.code.toLowerCase() === initialSubjectCode.toLowerCase()
      )
    : null;

  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>(
    initialSubject?.id || "all"
  );
  const [activeTab, setActiveTab] = React.useState<CategoryTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter items based on selected subject and search query
  const filteredArticles = React.useMemo(() => {
    let list = initialData.articles;
    if (selectedSubjectId !== "all") {
      list = list.filter((a) => a.subjectId === selectedSubjectId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
          (a.tags && a.tags.toLowerCase().includes(q))
      );
    }
    return list;
  }, [initialData.articles, selectedSubjectId, searchQuery]);

  const filteredNotes = React.useMemo(() => {
    let list = initialData.dailyNotes;
    if (selectedSubjectId !== "all") {
      list = list.filter((n) => n.subjectId === selectedSubjectId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.summary && n.summary.toLowerCase().includes(q)) ||
          n.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [initialData.dailyNotes, selectedSubjectId, searchQuery]);

  const filteredResources = React.useMemo(() => {
    let list = initialData.resources;
    if (selectedSubjectId !== "all") {
      list = list.filter((r) => r.subjectId === selectedSubjectId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [initialData.resources, selectedSubjectId, searchQuery]);

  // Featured article is shown on "all" and "articles" tab if no query or if it matches
  const shouldShowFeatured =
    (activeTab === "all" || activeTab === "articles") &&
    initialData.featuredArticle &&
    (selectedSubjectId === "all" || initialData.featuredArticle.subjectId === selectedSubjectId) &&
    (!searchQuery.trim() ||
      initialData.featuredArticle.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const otherArticles = React.useMemo(() => {
    if (shouldShowFeatured && initialData.featuredArticle) {
      return filteredArticles.filter((a) => a.id !== initialData.featuredArticle.id);
    }
    return filteredArticles;
  }, [filteredArticles, shouldShowFeatured, initialData.featuredArticle]);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Search & Filter Header Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 light:text-blue-600" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari artikel, catatan kuliah, modul, atau konsep..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#08152e]/80 light:bg-white border border-cyan-500/20 light:border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm text-white light:text-slate-900 placeholder:text-slate-400 transition-all outline-hidden shadow-[0_0_15px_rgba(6,182,212,0.06)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 p-0.5 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#08152e]/90 light:bg-slate-100 rounded-xl border border-cyan-500/20 light:border-slate-200 text-xs overflow-x-auto no-scrollbar shrink-0 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "all"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)] border border-cyan-400/30"
                  : "text-slate-300 light:text-slate-600 hover:text-white hover:bg-cyan-500/10"
              )}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab("articles")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "articles"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)] border border-cyan-400/30"
                  : "text-slate-300 light:text-slate-600 hover:text-white hover:bg-cyan-500/10"
              )}
            >
              <BookOpen size={13} />
              <span>Artikel</span>
              <span className="text-[10px] opacity-80 font-mono">({filteredArticles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "notes"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)] border border-cyan-400/30"
                  : "text-slate-300 light:text-slate-600 hover:text-white hover:bg-cyan-500/10"
              )}
            >
              <FileText size={13} />
              <span>Catatan</span>
              <span className="text-[10px] opacity-80 font-mono">({filteredNotes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer",
                activeTab === "resources"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)] border border-cyan-400/30"
                  : "text-slate-300 light:text-slate-600 hover:text-white hover:bg-cyan-500/10"
              )}
            >
              <FolderOpen size={13} />
              <span>Sumber Daya</span>
              <span className="text-[10px] opacity-80 font-mono">({filteredResources.length})</span>
            </button>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-mono text-cyan-400 light:text-blue-600 flex items-center gap-1 pr-1 shrink-0 font-semibold">
            <Filter size={12} />
            Mata Kuliah:
          </span>
          <button
            onClick={() => setSelectedSubjectId("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-mono transition-all shrink-0 cursor-pointer",
              selectedSubjectId === "all"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)] border border-cyan-400/30"
                : "bg-[#08152e]/80 light:bg-slate-100 text-slate-300 light:text-slate-600 border border-cyan-500/20 light:border-slate-200 hover:border-cyan-400/40 hover:text-cyan-300"
            )}
          >
            Semua ({initialData.subjects.length})
          </button>
          {initialData.subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-mono transition-all shrink-0 cursor-pointer",
                selectedSubjectId === sub.id
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)] border border-cyan-400/30"
                  : "bg-[#08152e]/80 light:bg-slate-100 text-slate-300 light:text-slate-600 border border-cyan-500/20 light:border-slate-200 hover:border-cyan-400/40 hover:text-cyan-300"
              )}
              title={sub.name}
            >
              {sub.code}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Article Hero (When available) */}
      {shouldShowFeatured && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-cyan-500/15 light:bg-blue-100 text-cyan-300 light:text-blue-700 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Sparkles size={12} className="text-cyan-400 light:text-blue-600" />
              Artikel Pilihan
            </span>
          </div>
          <ArticleCard article={initialData.featuredArticle} featuredVariant={true} />
        </section>
      )}

      {/* SECTION: Articles */}
      {(activeTab === "all" || activeTab === "articles") && (
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 light:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 light:bg-blue-50 border border-cyan-500/30 light:border-blue-200 text-cyan-400 light:text-blue-600 flex items-center justify-center shadow-xs">
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white light:text-slate-900 font-display">
                  Artikel & Modul Pembelajaran
                </h3>
                <p className="text-xs text-slate-400">
                  Panduan mendalam, tutorial konsep, dan studi kasus akademik
                </p>
              </div>
            </div>

            {activeTab === "all" && filteredArticles.length > 3 && (
              <Link
                href="/learning/articles"
                className="flex items-center gap-1 text-xs font-bold text-cyan-400 light:text-blue-600 hover:text-cyan-300 hover:underline"
              >
                <span>Lihat Semua ({filteredArticles.length})</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {otherArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === "all" ? otherArticles.slice(0, 6) : otherArticles).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : !shouldShowFeatured ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-cyan-500/20 bg-[#08152e]/50">
              <BookOpen size={32} className="mx-auto text-cyan-500/40 mb-2" />
              <p className="text-sm font-medium text-slate-400">
                Belum ada artikel yang cocok dengan filter atau kata kunci.
              </p>
            </div>
          ) : null}
        </section>
      )}

      {/* SECTION: Study Notes */}
      {(activeTab === "all" || activeTab === "notes") && (
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 light:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 light:bg-blue-50 border border-blue-500/30 light:border-blue-200 text-blue-400 light:text-blue-600 flex items-center justify-center shadow-xs">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white light:text-slate-900 font-display">
                  Catatan Kuliah & Jurnal Harian
                </h3>
                <p className="text-xs text-slate-400">
                  Ringkasan praktis sesi tatap muka dan poin penting diskusi kelas
                </p>
              </div>
            </div>

            {activeTab === "all" && filteredNotes.length > 3 && (
              <Link
                href="/learning/notes"
                className="flex items-center gap-1 text-xs font-bold text-cyan-400 light:text-blue-600 hover:text-cyan-300 hover:underline"
              >
                <span>Lihat Semua ({filteredNotes.length})</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeTab === "all" ? filteredNotes.slice(0, 6) : filteredNotes).map((note) => (
                <StudyNoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl border border-dashed border-cyan-500/20 bg-[#08152e]/50">
              <FileText size={32} className="mx-auto text-cyan-500/40 mb-2" />
              <p className="text-sm font-medium text-slate-400">
                Belum ada catatan kuliah untuk kriteria pencarian ini.
              </p>
            </div>
          )}
        </section>
      )}

      {/* SECTION: Resources */}
      {(activeTab === "all" || activeTab === "resources") && (
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 light:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-950/60 light:bg-teal-50 border border-teal-500/30 light:border-teal-200 text-teal-400 light:text-teal-600 flex items-center justify-center shadow-xs">
                <FolderOpen size={18} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white light:text-slate-900 font-display">
                  Sumber Daya & Berkas Pendukung
                </h3>
                <p className="text-xs text-slate-400">
                  Slide dosen, e-book, repositori resmi, dan tautan sistem kampus
                </p>
              </div>
            </div>

            {activeTab === "all" && filteredResources.length > 3 && (
              <Link
                href="/learning/resources"
                className="flex items-center gap-1 text-xs font-bold text-cyan-400 light:text-blue-600 hover:text-cyan-300 hover:underline"
              >
                <span>Lihat Semua ({filteredResources.length})</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeTab === "all" ? filteredResources.slice(0, 6) : filteredResources).map((resource) => (
                <LearningResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl border border-dashed border-cyan-500/20 bg-[#08152e]/50">
              <FolderOpen size={32} className="mx-auto text-cyan-500/40 mb-2" />
              <p className="text-sm font-medium text-slate-400">
                Belum ada sumber daya untuk kriteria pencarian ini.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
