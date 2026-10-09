"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, FileText, Calendar, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, cn } from "@/lib/utils";

export interface HomeMaterialsPreviewProps {
  materials?: any[];
  totalCount?: number;
  className?: string;
}

export function HomeMaterialsPreview({
  materials = [],
  totalCount = 0,
  className,
}: HomeMaterialsPreviewProps) {
  const displayMaterials = materials.slice(0, 3);

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              // Bahan Belajar
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Materi Kuliah
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {totalCount > 0
              ? `${totalCount} materi tersedia untuk dipelajari.`
              : "Temukan modul dan bahan ajar berdasarkan mata kuliahnya."}
          </p>
        </div>

        <Link href="/materials">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-cyan-400 light:text-blue-600 font-semibold cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Lihat Semua Materi
          </Button>
        </Link>
      </div>

      {displayMaterials.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <Card
            variant="interactive"
            padding="md"
            className="text-center border-dashed p-6 sm:p-8 space-y-3"
          >
            <Link href="/materials" className="block space-y-3 group focus-visible:outline-none">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 flex items-center justify-center mx-auto text-cyan-400 light:text-blue-600 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  Materi Perkuliahan Belum Diunggah
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
                  Modul dan bahan ajar dikelompokkan berdasarkan mata kuliah. Akses halaman materi untuk memilih mata kuliah dan melihat modul yang tersedia.
                </p>
              </div>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs pointer-events-none group-hover:bg-cyan-500/10 light:group-hover:bg-blue-50"
                  rightIcon={<ArrowRight size={13} />}
                >
                  Buka Repositori Materi
                </Button>
              </div>
            </Link>
          </Card>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            displayMaterials.length === 1
              ? "grid-cols-1 max-w-md"
              : displayMaterials.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {displayMaterials.map((m) => (
            <Link
              key={m.id}
              href={`/materials/${m.id}`}
              className="group block h-full focus-visible:outline-none"
            >
              <Card
                variant="interactive"
                padding="md"
                className="h-full p-5 flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/50 light:hover:border-blue-400/60"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700 border border-purple-500/30 light:border-purple-200">
                      {m.type || "PDF"}
                    </span>
                    {m.subject && (
                      <span className="font-mono text-xs font-bold text-cyan-400 light:text-blue-600 truncate">
                        {m.subject.code}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors line-clamp-2">
                      {m.title}
                    </h3>
                    {m.subject?.name && (
                      <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                        {m.subject.name}
                      </p>
                    )}
                  </div>

                  {m.description && (
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border-color)]/70 flex items-center justify-between text-[11px] font-medium text-cyan-400 light:text-blue-600 group-hover:text-cyan-300 light:group-hover:text-blue-700">
                  <span>Lihat materi →</span>
                  {m.fileSize && (
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {m.fileSize}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
