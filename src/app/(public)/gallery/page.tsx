import type { Metadata } from "next";
import { ImageIcon, Calendar } from "lucide-react";
import { getGalleryData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo gallery — class events, activities, and memories.",
};

export default async function GalleryPage() {
  const { gallery } = await getGalleryData();

  return (
    <div className="cosmic-canvas min-h-screen text-slate-100 pb-20">
      {/* Header */}
      <div className="relative py-14 px-4 border-b border-cyan-500/20 bg-[#060f22]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md">
            <ImageIcon size={13} className="text-cyan-400" />
            <span>Class Memories &bull; Visual Vault</span>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-cyan-glow flex-shrink-0">
              <ImageIcon size={22} />
            </div>
            <div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Photo Gallery
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                {gallery.length} captured moment{gallery.length !== 1 ? "s" : ""} &mdash; workshops, hackathons, and class memories
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {gallery.length === 0 ? (
          <div className="cyber-card p-16 text-center rounded-2xl bg-[#0a1a2f]/60 border border-cyan-500/20">
            <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-slate-200 font-semibold text-lg">No photos yet</h3>
            <p className="text-slate-400 text-sm mt-1">Photos from class events will appear here once uploaded.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {gallery.map((photo: any) => (
              <div key={photo.id} className="break-inside-avoid group cursor-pointer">
                <div className="cyber-card rounded-2xl overflow-hidden bg-[#0a1a2f]/75 border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-cyan-glow transition-all duration-300 hover:-translate-y-1">
                  <div className="overflow-hidden bg-[#061021] relative">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060b17]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4 bg-[#0a1a2f]/90 border-t border-cyan-500/15">
                    <p className="font-extrabold text-white text-sm leading-snug line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {photo.title}
                    </p>
                    {photo.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{photo.description}</p>
                    )}
                    {photo.eventDate && (
                      <div className="flex items-center gap-1.5 mt-2.5 text-xs text-cyan-300 font-mono">
                        <Calendar size={11} className="text-cyan-400" />
                        {formatDate(photo.eventDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
