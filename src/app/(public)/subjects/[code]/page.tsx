import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSubjectByCode } from "@/lib/data";
import { SubjectHubView } from "@/components/subjects/subject-hub-view";

interface SubjectDetailPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: SubjectDetailPageProps): Promise<Metadata> {
  const { code } = await params;
  const subject = await getSubjectByCode(code);
  if (!subject) {
    return { title: "Mata Kuliah Tidak Ditemukan | JS1SI-26-REG-05" };
  }
  return {
    title: `${subject.code} - ${subject.name} | JS1SI-26-REG-05`,
    description: subject.description || `Learning hub mata kuliah ${subject.name} kelas JS1SI-26-REG-05 Telkom University Jakarta.`,
  };
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { code } = await params;
  const subject = await getSubjectByCode(code);

  if (!subject) {
    notFound();
  }

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          href="/subjects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar Mata Kuliah</span>
        </Link>

        <SubjectHubView subject={subject} />
      </div>
    </div>
  );
}
