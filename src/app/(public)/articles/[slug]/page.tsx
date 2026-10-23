import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Tag,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  Layers,
  ChevronLeft,
} from "lucide-react";
import { getArticleBySlug } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { ArticleContentRenderer } from "@/components/learning/article-content-renderer";
import { TableOfContents } from "@/components/learning/table-of-contents";
import { ArticleCard } from "@/components/learning/article-card";

export const dynamic = "force-dynamic";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArticleBySlug(slug, { allowDraft: true });

  if (!data || !data.article) {
    return { title: "Artikel Tidak Ditemukan | JS1SI-26-REG-05" };
  }

  const article = data.article;

  return {
    title: `${article.title} | Artikel JS1SI-26-REG-05`,
    description: article.excerpt || `Artikel pembelajaran kelas JS1SI-26-REG-05: ${article.title}.`,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const [data, user] = await Promise.all([
    getArticleBySlug(slug, { allowDraft: true }),
    getCurrentUser(),
  ]);

  if (!data || !data.article) {
    notFound();
  }

  const article = data.article as any;
  const relatedArticles = data.relatedArticles || [];
  const prevArticle = data.prevArticle;
  const nextArticle = data.nextArticle;

  // Authorization check on server: drafts & archived articles require privileged role
  const isPrivileged =
    user && ["ADMIN", "CLASS_ADMIN", "LECTURER", "ASSISTANT"].includes(user.role);

  if (article.status !== "PUBLISHED" && !isPrivileged) {
    notFound();
  }

  const readingTime = calculateReadingTime(article.content);
  const subject = article.subject;
  const weekMatch = (article.title as string).match(/\bweek\s*(\d+)\b|\bminggu\s*(\d+)\b/i);
  const weekNumber = weekMatch ? (weekMatch[1] || weekMatch[2]) : null;
  const tags = article.tags
    ? article.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
    : [];

  const connectedNotes = article.notes || article.dailyNotes || [];

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 pb-28 pt-28">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Top Breadcrumbs & Back Link */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap font-mono"
          >
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Artikel
            </Link>
            {subject && (
              <>
                <span>/</span>
                <Link
                  href={`/articles?subject=${subject.id}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {subject.code}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs font-semibold">
              {article.title}
            </span>
          </nav>

          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors shrink-0"
          >
            <ArrowLeft size={13} />
            <span>Semua Artikel</span>
          </Link>
        </div>

        {/* Visibility Banner for non-published articles */}
        {article.status !== "PUBLISHED" && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                {article.status}
              </span>
              <span>
                Artikel ini berstatus <strong>{article.status}</strong> dan hanya dapat dilihat oleh pengajar &amp; admin.
              </span>
            </div>
            {isPrivileged && (
              <Link
                href={`/admin/articles/${article.id}/edit`}
                className="text-amber-800 dark:text-amber-200 hover:underline font-semibold"
              >
                Edit di Admin &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Article Header Hero */}
        <header className="space-y-6 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {subject && (
              <Link
                href={`/articles?subject=${subject.id}`}
                className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-semibold transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                {subject.code} &bull; {subject.name}
              </Link>
            )}

            {weekNumber && (
              <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold">
                Minggu {weekNumber}
              </span>
            )}

            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-600 dark:text-blue-400" />
              <span>{formatDate(article.updatedAt || article.publishedAt || article.createdAt)}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-[1.18]">
            {article.title}
          </h1>

          {/* Excerpt / Lead Paragraph */}
          {article.excerpt && (
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-sans border-l-2 border-blue-600 dark:border-blue-500 pl-4 italic">
              {article.excerpt}
            </p>
          )}

          {/* Author Attribution */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 font-display text-sm overflow-hidden">
                {article.author?.avatar ? (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{article.author?.name?.charAt(0) || "A"}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {article.author?.name || "Tim Akademik"}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {article.author?.role?.replace("_", " ") || "Penulis"} &bull; JS1SI-26-REG-05
                </div>
              </div>
            </div>
          </div>

          {/* Cover image if available */}
          {article.coverImage && (
            <div className="relative aspect-[21/9] sm:aspect-[2/1] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mt-4 bg-slate-100 dark:bg-slate-900">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
          )}
        </header>

        {/* Main 2-Column Pedagogical Layout: Content + Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8">
          {/* Main Article Content */}
          <main className="lg:col-span-8 2xl:col-span-9 space-y-8 sm:space-y-10">
            {/* Mobile Quick Jump Table of Contents */}
            <div className="lg:hidden">
              <TableOfContents content={article.content} variant="mobile" />
            </div>

            {/* Rich Article Body */}
            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xs">
              <ArticleContentRenderer content={article.content} />
            </article>

            {/* Tags section */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                  <Tag size={12} /> Topik Terkait:
                </span>
                {tags.map((t: string) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Attached Reference Resources if available */}
            {article.resources && article.resources.length > 0 && (
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-6 space-y-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <FolderOpen size={16} />
                  <span>Berkas &amp; Sumber Daya Rujukan</span>
                </div>
                <div className="space-y-2.5">
                  {article.resources.map(({ resource }: any) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-between gap-3 group transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                          <ExternalLink size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {resource.title}
                          </div>
                          {resource.description && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {resource.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 flex-shrink-0">
                        <span>Buka</span>
                        <ChevronRight size={13} />
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Connected Daily Notes */}
            {connectedNotes.length > 0 && (
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-mono text-xs font-bold uppercase tracking-wider">
                  <Layers size={15} className="text-emerald-500" />
                  <span>Catatan Perkuliahan Terkait</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {connectedNotes.map((note: any) => (
                    <Link
                      key={note.id}
                      href={`/daily-notes/${note.id}`}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 group transition-colors block"
                    >
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mb-1">
                        {formatDate(note.date)}
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {note.title}
                      </div>
                      {note.summary && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {note.summary}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Previous and Next Article Links */}
            {(prevArticle || nextArticle) && (
              <nav aria-label="Navigasi artikel" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                {prevArticle ? (
                  <Link
                    href={`/articles/${prevArticle.slug}`}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-colors group block text-left shadow-xs"
                  >
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mb-1">
                      <ChevronLeft size={13} />
                      <span>Artikel Sebelumnya</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {prevArticle.title}
                    </div>
                  </Link>
                ) : <div />}

                {nextArticle && (
                  <Link
                    href={`/articles/${nextArticle.slug}`}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-colors group block text-right shadow-xs"
                  >
                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-end gap-1 mb-1">
                      <span>Artikel Selanjutnya</span>
                      <ChevronRight size={13} />
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {nextArticle.title}
                    </div>
                  </Link>
                )}
              </nav>
            )}
          </main>

          {/* Sticky Sidebar: Table of Contents & Subject Quick Info */}
          <aside className="hidden lg:block lg:col-span-4 2xl:col-span-3 space-y-6">
            <div className="sticky top-28 space-y-6">
              {/* Table of Contents */}
              <TableOfContents content={article.content} variant="desktop" />

              {/* Subject Info Card */}
              {subject && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Mata Kuliah Terkait
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {subject.code}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {subject.name}
                    </h4>
                    {subject.lecturerName && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Dosen: {subject.lecturerName}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/subjects/${subject.code}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>Buka Detail Mata Kuliah</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Related Articles Grid */}
        {relatedArticles.length > 0 && (
          <section className="pt-16 mt-16 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Artikel Terkait Lainnya
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lanjutkan eksplorasi materi perkuliahan dengan topik senada.
                </p>
              </div>
              <Link
                href="/articles"
                className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel: any) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
