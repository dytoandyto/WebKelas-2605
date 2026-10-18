import type { Metadata } from "next";
import { getSubjectsData } from "@/lib/data";
import { ArticleEditor } from "@/components/admin/article-editor";

export const metadata: Metadata = {
  title: "Tulis Artikel Baru | Admin JS1SI-26-REG-05",
  description: "Buat dan publikasikan artikel pembelajaran baru di Learning Hub.",
};

export default async function CreateArticlePage() {
  const { subjects } = await getSubjectsData();

  return (
    <div className="w-full py-2">
      <ArticleEditor subjects={subjects as any} />
    </div>
  );
}
