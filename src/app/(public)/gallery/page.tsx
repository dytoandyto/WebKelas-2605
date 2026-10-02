import type { Metadata } from "next";
import { ImageIcon, Calendar } from "lucide-react";
import { getGalleryData } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { PageHeader, ContentContainer, EmptyState } from "@/components/shared";

export const metadata: Metadata = {
  title: "Galeri Dokumentasi | JS1SI-26-REG-05",
  description:
    "Arsip foto dan dokumentasi kegiatan, praktikum, dan kebersamaan kelas JS1SI-26-REG-05 Telkom University Jakarta.",
};

export default async function GalleryPage() {
  const { gallery } = await getGalleryData();

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge="VISUAL VAULT • DOKUMENTASI"
          title="Galeri & Jejak Kegiatan"
          description="Arsip visual perjalanan mahasiswa JS1SI-26-REG-05 — mulai dari perkuliahan perdana, praktikum lab, kegiatan himpunan, hingga kebersamaan angkatan."
          breadcrumbs={[{ label: "Galeri" }]}
          actions={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold">
              <ImageIcon size={13} />
              <span>{gallery.length} Momen Tersimpan</span>
            </div>
          }
        />

        {gallery.length === 0 ? (
          <EmptyState
            icon={<ImageIcon />}
            title="Belum Ada Foto Terunggah"
            description="Dokumentasi foto kegiatan kelas akan segera dipublikasikan di galeri ini."
          />
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {gallery.map((photo: any) => (
              <div
                key={photo.id}
                className="break-inside-avoid group cursor-pointer"
              >
                <div className="card rounded-2xl overflow-hidden hover:border-[var(--primary)] transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
                  <div className="overflow-hidden bg-[var(--bg-muted)] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  <div className="p-4 space-y-1.5 bg-[var(--bg-card)] border-t border-[var(--border-color)]/60">
                    <p className="font-bold text-[var(--text-primary)] text-sm leading-snug line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                      {photo.title}
                    </p>
                    {photo.description && (
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {photo.description}
                      </p>
                    )}
                    {photo.eventDate && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs text-[var(--text-muted)] font-mono">
                        <Calendar size={11} className="text-[var(--primary)]" />
                        <span>{formatDate(photo.eventDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentContainer>
    </div>
  );
}