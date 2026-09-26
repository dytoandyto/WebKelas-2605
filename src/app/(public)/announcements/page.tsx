import type { Metadata } from "next";
import { Megaphone, Calendar, User } from "lucide-react";
import { getAnnouncementsData } from "@/lib/data";
import { formatDate, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Official class announcements and important notices.",
};

export default async function AnnouncementsPage() {
  const { announcements } = await getAnnouncementsData();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Megaphone className="text-white" size={20} />
            </div>
            <div>
              <h1 className="page-title">Announcements</h1>
              <p className="text-slate-500 text-sm">
                {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {announcements.length === 0 ? (
          <div className="card p-16 text-center">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-600 font-semibold">No announcements yet</h3>
            <p className="text-slate-400 text-sm mt-1">Check back later for class announcements.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {announcements.map((ann: any) => (
              <article
                key={ann.id}
                className="card overflow-hidden"
                aria-label={ann.title}
              >
                {ann.imageUrl && (
                  <div className="h-56 overflow-hidden bg-slate-100">
                    <img
                      src={ann.imageUrl}
                      alt={ann.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="badge badge-blue mb-2">Announcement</span>
                      <h2 className="text-xl font-bold text-slate-900 leading-snug">{ann.title}</h2>
                    </div>
                  </div>
                  <div className="prose-content text-base text-slate-600 mb-4">{ann.content}</div>
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <User size={13} />
                      {ann.creator?.name}
                      {ann.creator?.role && (
                        <span className="badge badge-gray text-xs ml-1">{ann.creator.role.replace("_", " ")}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {formatDate(ann.publishedAt || ann.createdAt)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
