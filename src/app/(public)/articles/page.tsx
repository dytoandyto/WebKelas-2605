import type { Metadata } from "next";
import Link from "next/link";
import { getArticlesData, getSubjectsData, getSettings } from "@/lib/data";
import { PageHeader, ContentContainer } from "@/components/shared";
import { EmptyState } from "@/components/ui/empty-state";
import { ArticleCard } from "@/components/learning/article-card";
import { BookOpen, Search, Filter, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Artikel Edukasi | JS1SI-26-REG-05",
  description:
    "Kumpulan artikel pembelajaran mendalam, tutorial pemrograman, dan wawasan sistem informasi kelas JS1SI-26-REG-05 Telkom University Jakarta.",
};

interface ArticlesPageProps {
  searchParams: Promise<{ subject?: string; q?: string; page?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { subject, q, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  const [{ articles, total, totalPages }, { subjects }, settings] = await Promise.all([
    getArticlesData({
      subjectId: subject,
      search: q,
      page: currentPage,
      limit: 12,
    }),
    getSubjectsData(),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";

  // Identify featured article for the first page
  const featuredArticle = currentPage === 1 && !q ? articles.find((a: any) => a.isFeatured) : null;
  const standardArticles = featuredArticle ? articles.filter((a: any) => a.id !== featuredArticle.id) : articles;

  // Query string builder helper for filters and pagination
  const buildUrl = (newParams: { subject?: string; q?: string; page?: number }) => {
    const params = new URLSearchParams();
    const finalSubject = newParams.subject !== undefined ? newParams.subject : subject;
    const finalQ = newParams.q !== undefined ? newParams.q : q;
    const finalPage = newParams.page !== undefined ? newParams.page : 1;

    if (finalSubject) params.set("subject", finalSubject);
    if (finalQ) params.set("q", finalQ);
    if (finalPage > 1) params.set("page", finalPage.toString());

    const qs = params.toString();
    return `/articles${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 pb-24 pt-28">
      <ContentContainer>
        {/* Editorial Page Header */}
        <PageHeader
          badge={`ARTIKEL EDUKASI • ${classCode}`}
          title="Artikel & Panduan Belajar"
          description="Eksplorasi konsep fundamental perkuliahan, tutorial pemrograman, dan wawasan sistem informasi yang disajikan secara terstruktur dan mendalam."
          breadcrumbs={[
            { label: "Beranda", href: "/" },
            { label: "Artikel" },
          ]}
        />

        {/* Filter and Search Controls */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input Bar */}
            <form method="GET" action="/articles" className="relative flex-1 max-w-xl">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                name="q"
                defaultValue={q || ""}
                placeholder="Cari judul artikel, topik, atau kata kunci..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors shadow-xs"
              />
              {subject && <input type="hidden" name="subject" value={subject} />}
            </form>

            {/* Quick Stat / Counter */}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 self-end md:self-center">
              <span>Menampilkan {articles.length} dari {total} artikel</span>
            </div>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Link
              href={buildUrl({ subject: "" })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium font-mono whitespace-nowrap transition-colors ${
                !subject
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              Semua ({total})
            </Link>
            {subjects.map((s: any) => {
              const isSelected = subject === s.id;
              return (
                <Link
                  key={s.id}
                  href={buildUrl({ subject: s.id })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium font-mono whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {s.code} &bull; {s.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {articles.length === 0 ? (
          <EmptyState
            icon={<BookOpen />}
            title="Belum Ada Artikel Diterbitkan"
            description={
              q || subject
                ? "Tidak ada artikel yang cocok dengan kata kunci atau filter mata kuliah yang dipilih. Coba reset pencarian."
                : "Artikel edukasi dan rangkuman materi perkuliahan baru akan segera diterbitkan di sini."
            }
            action={
              (q || subject) ? (
                <Link
                  href="/articles"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Reset Semua Filter
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-8">
            {/* Featured Article Hero (Page 1) */}
            {featuredArticle && (
              <div className="mb-4">
                <ArticleCard article={featuredArticle} featuredVariant={true} />
              </div>
            )}

            {/* Standard Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {standardArticles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-200 dark:border-slate-800">
                {currentPage > 1 && (
                  <Link
                    href={buildUrl({ page: currentPage - 1 })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span>Sebelumnya</span>
                  </Link>
                )}

                <div className="flex items-center gap-1 text-xs font-mono">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage;
                    return (
                      <Link
                        key={p}
                        href={buildUrl({ page: p })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={buildUrl({ page: currentPage + 1 })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </ContentContainer>
    </div>
  );
}
