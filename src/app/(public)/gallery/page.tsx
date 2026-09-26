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
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <ImageIcon className="text-white" size={20} />
            </div>
            <div>
              <h1 className="page-title">Photo Gallery</h1>
              <p className="text-slate-500 text-sm">
                {gallery.length} photo{gallery.length !== 1 ? "s" : ""} — class events and memories
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {gallery.length === 0 ? (
          <div className="card p-16 text-center">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-600 font-semibold">No photos yet</h3>
            <p className="text-slate-400 text-sm mt-1">Photos from class events will appear here.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {gallery.map((photo: any) => (
              <div key={photo.id} className="break-inside-avoid group cursor-pointer">
                <div className="card overflow-hidden">
                  <div className="overflow-hidden bg-slate-100">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-slate-900 text-sm leading-snug line-clamp-1">{photo.title}</p>
                    {photo.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{photo.description}</p>
                    )}
                    {photo.eventDate && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                        <Calendar size={10} />
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
