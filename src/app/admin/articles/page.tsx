import type { Metadata } from "next";
import { getAdminArticlesData, getSubjectsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { ArticlesManager } from "./articles-manager";

export const metadata: Metadata = {
  title: "Kelola Artikel Edukasi | Admin JS1SI-26-REG-05",
  description: "Manajemen artikel pembelajaran, tutorial, dan kurikulum akademik kelas.",
};

export default async function AdminArticlesPage() {
  const [{ articles }, { subjects }] = await Promise.all([
    getAdminArticlesData(),
    getSubjectsData(),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Artikel & Panduan Edukasi"
        description="Kelola publikasi materi bacaan mendalam, tutorial pemrograman, dan wawasan sistem informasi mahasiswa kelas."
      />
      <div className="w-full">
        <ArticlesManager
          initialArticles={articles as any}
          subjects={subjects as any}
        />
      </div>
    </div>
  );
}
