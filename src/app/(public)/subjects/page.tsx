import type { Metadata } from "next";
import Link from "next/link";
import { User, ChevronRight } from "lucide-react";
import { getSubjectsData, getSettings } from "@/lib/data";
import { PageHeader, ContentContainer } from "@/components/shared";

export const metadata: Metadata = {
  title: "Mata Kuliah | JS1SI-26-REG-05",
  description:
    "Daftar mata kuliah kurikulum S1 Sistem Informasi Semester Ganjil 2026/2027 kelas JS1SI-26-REG-05 Telkom University Jakarta.",
};

export default async function SubjectsPage() {
  const [{ subjects }, settings] = await Promise.all([
    getSubjectsData(),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";
  const academicYear = settings.semester || "Semester Ganjil 2026/2027";

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge={`MATA KULIAH • ${classCode}`}
          title="Mata Kuliah"
          description={`Daftar mata kuliah semester ini untuk kelas ${classCode}. Pilih mata kuliah untuk melihat detail, silabus, dan materi terkait.`}
          breadcrumbs={[{ label: "Mata Kuliah" }]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub: any) => (
            <div
              key={sub.id}
              className="card p-6 bg-[var(--bg-surface)] hover:border-[var(--primary)] transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] dark:text-cyan-300 font-mono text-xs font-bold">
                    {sub.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                    {sub.sks ? `${sub.sks} SKS` : "3 SKS"}
                  </span>
                </div>

                <Link href={`/subjects/${sub.code}`}>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors leading-snug">
                    {sub.name}
                  </h3>
                </Link>

                {sub.englishName && (
                  <p className="text-xs text-[var(--text-muted)] italic">
                    {sub.englishName}
                  </p>
                )}

                {sub.description && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>
                )}

                {sub.lecturerName && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] pt-1 font-mono">
                    <User size={13} className="text-[var(--primary)]" />
                    <span>Dosen: {sub.lecturerName}</span>
                  </div>
                )}
              </div>

              {/* Activity counters */}
              <div className="pt-4 border-t border-[var(--border-color)]/60 mt-5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-[var(--text-muted)] font-mono text-[11px]">
                  <span>{sub._count?.schedules || 0} Jadwal</span>
                  <span>&bull;</span>
                  <span>{sub._count?.tasks || 0} Tugas</span>
                  <span>&bull;</span>
                  <span>{sub._count?.materials || 0} Materi</span>
                </div>

                <Link
                  href={`/subjects/${sub.code}`}
                  className="text-xs font-bold text-[var(--primary)] dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Lihat detail</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </ContentContainer>
    </div>
  );
}
