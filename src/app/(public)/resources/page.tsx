import type { Metadata } from "next";
import { FolderOpen, ExternalLink } from "lucide-react";
import { getResourcesData } from "@/lib/data";
import { ResourceCategory } from "@prisma/client";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Resources",
  description: "Class resources — academic materials, references, and important links.",
};

const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  ACADEMIC: "📚 Academic",
  CLASS: "🏫 Class",
  REFERENCE: "📖 Reference",
  IMPORTANT_LINK: "🔗 Important Links",
  OTHER: "📁 Other",
};

const CATEGORY_BADGE: Record<ResourceCategory, string> = {
  ACADEMIC: "badge-blue",
  CLASS: "badge-purple",
  REFERENCE: "badge-green",
  IMPORTANT_LINK: "badge-amber",
  OTHER: "badge-gray",
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
    <div className="cosmic-canvas min-h-screen text-slate-100 pb-20">
      {/* Header */}
      <div className="relative py-14 px-4 border-b border-cyan-500/20 bg-[#060f22]/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md">
            <FolderOpen size={13} className="text-cyan-400" />
            <span>Academic Knowledge Base &bull; Repositories & Links</span>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-cyan-glow flex-shrink-0">
              <FolderOpen size={22} />
            </div>
            <div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Resources & Materials
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                {resources.length} verified resource{resources.length !== 1 ? "s" : ""} &mdash; course syllabi, repositories, and study drives
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {resources.length === 0 ? (
          <div className="cyber-card p-16 text-center rounded-2xl bg-[#0a1a2f]/60 border border-cyan-500/20">
            <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-slate-200 font-semibold text-lg">No resources yet</h3>
            <p className="text-slate-400 text-sm mt-1">Class resources and links will appear here once added.</p>
          </div>
        ) : (
          orderedCats.map((cat) => {
            const catResources = grouped[cat];
            if (!catResources || catResources.length === 0) return null;
            return (
              <section key={cat} className="space-y-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-3">
                  <span>{CATEGORY_LABEL[cat]}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    {catResources.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catResources.map((res: any) => (
                    <a
                      key={res.id}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cyber-card p-5 rounded-2xl bg-[#0a1a2f]/70 border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-cyan-glow flex items-start gap-4 group transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#061021] border border-cyan-500/25 flex items-center justify-center flex-shrink-0 group-hover:border-cyan-400 group-hover:bg-cyan-950/60 transition-colors">
                        <ExternalLink size={16} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          <span className={cn("badge text-xs", CATEGORY_BADGE[cat])}>
                            {cat.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {res.title}
                        </h3>
                        {res.description && (
                          <p className="text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">{res.description}</p>
                        )}
                        <p className="text-xs text-cyan-400/80 mt-2.5 truncate font-mono">{res.url}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
