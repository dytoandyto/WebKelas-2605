import type { Metadata } from "next";
import { Megaphone, Calendar, User, Bell } from "lucide-react";
import { getAnnouncementsData } from "@/lib/data";
import { formatDate, cn } from "@/lib/utils";
import { PageHeader, ContentContainer, EmptyState } from "@/components/shared";

export const metadata: Metadata = {
  title: "Pengumuman Kelas | JS1SI-26-REG-05",
  description: "Warta resmi, informasi penting perkuliahan, dan pengumuman kelas JS1SI-26-REG-05 Telkom University Jakarta.",
};

export default async function AnnouncementsPage() {
  const { announcements } = await getAnnouncementsData();

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge="OFFICIAL BULLETINS • PENGUMUMAN"
          title="Warta & Pengumuman Kelas"
          description="Papan pengumuman resmi perkuliahan, agenda angkatan, dan informasi mendesak untuk seluruh mahasiswa JS1SI-26-REG-05."
          breadcrumbs={[{ label: "Pengumuman" }]}
          actions={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold">
              <Bell size={13} />
              <span>{announcements.length} Warta Diterbitkan</span>
            </div>
          }
        />

        {announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Belum Ada Pengumuman"
            description="Belum ada warta resmi atau pengumuman penting yang dipublikasikan saat ini. Periksa kembali nanti."
          />
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {announcements.map((ann: any) => (
              <article
                key={ann.id}
                className="card rounded-2xl overflow-hidden hover:border-[var(--primary)] transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label={ann.title}
              >
                {ann.imageUrl && (
                  <div className="h-64 sm:h-72 overflow-hidden bg-[var(--bg-muted)] relative border-b border-[var(--border-color)]">
                    <img
                      src={ann.imageUrl}
                      alt={ann.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                      WARTA KELAS
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)]">
                      <Calendar size={13} className="text-[var(--primary)]" />
                      {formatDate(ann.publishedAt || ann.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-display leading-snug">
                    {ann.title}
                  </h2>

                  <div className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-line font-sans">
                    {ann.content}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-color)]/60 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                      <User size={13} className="text-[var(--primary)]" />
                      <span>{ann.creator?.name || "Admin Kelas"}</span>
                      {ann.creator?.role && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-muted)] text-[var(--text-muted)] border border-[var(--border-color)] ml-1">
                          {ann.creator.role.replace("_", " ")}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </ContentContainer>
    </div>
  );
}
