"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, cn } from "@/lib/utils";

export interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category?: string | null;
  eventDate?: Date | string | null;
}

export interface GalleryShowcaseProps {
  items: GalleryItem[];
  className?: string;
}

export function GalleryShowcase({ items, className }: GalleryShowcaseProps) {
  if (items.length === 0) return null;

  const mainItem = items[0];
  const sideItems = items.slice(1, 4);

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              // Momen & Dokumentasi
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Galeri Kegiatan & Kenangan
          </h2>
        </div>

        <Link href="/gallery">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-cyan-400 light:text-blue-600 font-semibold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Lihat Galeri Lengkap
          </Button>
        </Link>
      </div>

      {/* Asymmetric Editorial Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Large Item (7 cols) */}
        {mainItem && (
          <div className="lg:col-span-7 relative h-[320px] sm:h-[400px] rounded-2xl overflow-hidden group cursor-pointer border border-[var(--border-color)] bg-slate-900 shadow-md">
            <Image
              src={mainItem.imageUrl}
              alt={mainItem.title}
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 space-y-1.5">
              {mainItem.category && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {mainItem.category}
                </span>
              )}
              <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                {mainItem.title}
              </h3>
              {mainItem.description && (
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                  {mainItem.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Side Stacked Items (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {sideItems.map((item) => (
            <div
              key={item.id}
              className="relative h-[180px] sm:h-[190px] rounded-2xl overflow-hidden group cursor-pointer border border-[var(--border-color)] bg-slate-900 shadow-sm"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 50vw, 400px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute bottom-0 inset-x-0 p-4 space-y-1">
                {item.category && (
                  <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-bold">
                    {item.category}
                  </span>
                )}
                <h4 className="text-sm font-bold text-white line-clamp-1">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
