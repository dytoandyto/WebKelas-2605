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
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <FolderOpen className="text-white" size={20} />
            </div>
            <div>
              <h1 className="page-title">Resources</h1>
              <p className="text-slate-500 text-sm">
                {resources.length} resource{resources.length !== 1 ? "s" : ""} — materials and links
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {resources.length === 0 ? (
          <div className="card p-16 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-600 font-semibold">No resources yet</h3>
            <p className="text-slate-400 text-sm mt-1">Class resources and links will appear here.</p>
          </div>
        ) : (
          orderedCats.map((cat) => {
            const catResources = grouped[cat];
            if (!catResources || catResources.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  {CATEGORY_LABEL[cat]}
                  <span className="badge badge-gray">{catResources.length}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catResources.map((res: any) => (
                    <a
                      key={res.id}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card p-4 card-interactive flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 transition-colors">
                        <ExternalLink size={16} className="text-slate-500 group-hover:text-brand-600 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={cn("badge", CATEGORY_BADGE[cat])}>
                            {cat.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
                          {res.title}
                        </h3>
                        {res.description && (
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{res.description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1.5 truncate">{res.url}</p>
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
