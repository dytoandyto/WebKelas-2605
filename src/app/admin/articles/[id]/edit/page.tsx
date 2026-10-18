import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleById, getSubjectsData } from "@/lib/data";
import { ArticleEditor } from "@/components/admin/article-editor";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) {
    return { title: "Artikel Tidak Ditemukan | Admin" };
  }
  return {
    title: `Edit: ${article.title} | Admin JS1SI-26-REG-05`,
  };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const [article, { subjects }] = await Promise.all([
    getArticleById(id),
    getSubjectsData(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="w-full py-2">
      <ArticleEditor
        isEdit
        initialData={article as any}
        subjects={subjects as any}
      />
    </div>
  );
}
