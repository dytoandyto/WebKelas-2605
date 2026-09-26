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
    <div className="cosmic-canvas min-h-screen text-slate-100 pb-20">
      {/* Header */}
      <div className="relative py-14 px-4 border-b border-cyan-500/20 bg-[#060f22]/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md">
            <Megaphone size={13} className="text-cyan-400" />
            <span>Official Bulletins &bull; Important Notices</span>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-cyan-glow flex-shrink-0">
              <Megaphone size={22} />
            </div>
            <div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Announcements
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                {announcements.length} announcement{announcements.length !== 1 ? "s" : ""} published
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {announcements.length === 0 ? (
          <div className="cyber-card p-16 text-center rounded-2xl bg-[#0a1a2f]/60 border border-cyan-500/20">
            <Megaphone className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-slate-200 font-semibold text-lg">No announcements yet</h3>
            <p className="text-slate-400 text-sm mt-1">Check back later for class bulletins and notices.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((ann: any) => (
              <article
                key={ann.id}
                className="cyber-card rounded-2xl overflow-hidden bg-[#0a1a2f]/75 border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-cyan-glow transition-all duration-300"
                aria-label={ann.title}
              >
                {ann.imageUrl && (
                  <div className="h-64 overflow-hidden bg-[#061021]">
                    <img
                      src={ann.imageUrl}
                      alt={ann.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 mb-2.5">
                        Class Notice
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">{ann.title}</h2>
                    </div>
                  </div>
                  <div className="prose-content text-sm sm:text-base text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
                    {ann.content}
                  </div>
                  <div className="flex items-center gap-5 pt-4 border-t border-cyan-500/15 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <User size={13} className="text-cyan-400" />
                      {ann.creator?.name}
                      {ann.creator?.role && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#061021] text-slate-400 border border-cyan-500/20 ml-1">
                          {ann.creator.role.replace("_", " ")}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-slate-400">
                      <Calendar size={13} className="text-cyan-400" />
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
