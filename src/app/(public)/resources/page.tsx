import type { Metadata } from "next";
import { FolderOpen, ExternalLink, Link as LinkIcon } from "lucide-react";
import { getResourcesData } from "@/lib/data";
import { ResourceCategory } from "@prisma/client";
import { PageHeader, ContentContainer, EmptyState } from "@/components/shared";

export const metadata: Metadata = {
  title: "Tautan & Sumber Daya | JS1SI-26-REG-05",
  description: "Tautan penting, repositori kurikulum, portal kampus, dan referensi akademik kelas JS1SI-26-REG-05 Telkom University Jakarta.",
};

const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  ACADEMIC: "📚 Akademik & Silabus",
  CLASS: "🏫 Tautan Resmi Kelas",
  REFERENCE: "📖 Bahan Bacaan & Referensi",
  IMPORTANT_LINK: "🔗 Portal & Sistem Kampus",
  OTHER: "📁 Berkas Lainnya",
};

const CATEGORY_BADGE: Record<ResourceCategory, string> = {
  ACADEMIC: "badge-blue",
  CLASS: "badge-purple",
  REFERENCE: "badge-emerald",
  IMPORTANT_LINK: "badge-amber",
  OTHER: "badge-cyan",
};

export default async function ResourcesPage() {
  const { resources } = await getResourcesData();

  // Group by category
  const grouped: Partial<Record<ResourceCategory, typeof resources>> = {};
  for (const res of resources) {
    const cat = res.category as ResourceCategory;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat]!.push(res);
  }

  const orderedCats = Object.keys(ResourceCategory) as ResourceCategory[];

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge="ACADEMIC REPOSITORY • SUMBER DAYA"
          title="Tautan & Sumber Daya Akademik"
          description="Kumpulan repositori resmi, portal iGracias, google drive materi, dan referensi penting perkuliahan JS1SI-26-REG-05."
          breadcrumbs={[{ label: "Sumber Daya" }]}
          actions={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold">
              <FolderOpen size={13} />
              <span>{resources.length} Sumber Daya Tersedia</span>
            </div>
          }
        />

        {resources.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Belum Ada Sumber Daya"
            description="Tautan dan referensi akademik kelas akan segera ditambahkan di sini."
          />
        ) : (
          <div className="space-y-10 max-w-5xl mx-auto">
            {orderedCats.map((cat) => {
              const catResources = grouped[cat];
              if (!catResources || catResources.length === 0) return null;
              return (
                <section key={cat} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-display">
                      {CATEGORY_LABEL[cat]}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--bg-muted)] text-[var(--text-muted)] border border-[var(--border-color)]">
                      {catResources.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {catResources.map((res: any) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card p-5 hover:border-[var(--primary)] flex items-start gap-4 group transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 group-hover:border-[var(--primary)] group-hover:bg-cyan-500/10 transition-colors">
                          <ExternalLink size={16} className="text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${CATEGORY_BADGE[cat] || "badge-blue"}`}>
                              {cat.replace("_", " ")}
                            </span>
                          </div>
                          <h3 className="font-bold text-[var(--text-primary)] text-sm sm:text-base leading-snug group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                            {res.title}
                          </h3>
                          {res.description && (
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                              {res.description}
                            </p>
                          )}
                          <p className="text-xs text-[var(--primary)] mt-2.5 truncate font-mono flex items-center gap-1">
                            <LinkIcon size={11} />
                            <span>{res.url}</span>
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </ContentContainer>
    </div>
  );
}
