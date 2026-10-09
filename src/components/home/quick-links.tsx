"use client";

import * as React from "react";
import { QuickLinkCard } from "./quick-link-card";
import { cn } from "@/lib/utils";
import { CampusLinksSettings } from "@/lib/homepage/types";

export interface QuickLinksProps {
  settings?: CampusLinksSettings;
  layout?: "vertical" | "grid";
  className?: string;
}

export function QuickLinks({
  settings,
  layout = "vertical",
  className,
}: QuickLinksProps) {
  const defaultLinks = [
    {
      title: "MyTelU",
      description: "Portal layanan Tel-U.",
      href: "https://satu.telkomuniversity.ac.id",
      logoSrc: "/images/campus/mytelu.png",
      visible: true,
    },
    {
      title: "LMS Tel-U",
      description: "Materi dan pembelajaran.",
      href: "https://lms.telkomuniversity.ac.id/",
      logoSrc: "/images/campus/celoe.png",
      visible: true,
    },
    {
      title: "iGracias",
      description: "Layanan akademik.",
      href: "https://igracias.telkomuniversity.ac.id",
      logoSrc: "/images/campus/igracias.png",
      visible: true,
    },
  ];

  const title = settings?.title || "Akses Cepat Kampus";
  const description = settings?.description || "Portal yang sering dibuka";

  const linksToRender = settings?.links
    ? settings.links
        .filter((l) => l.visible !== false)
        .map((l) => {
          let logoSrc = "/images/campus/mytelu.png";
          if (l.iconKey === "lms" || l.url.includes("lms")) logoSrc = "/images/campus/celoe.png";
          if (l.iconKey === "igracias" || l.url.includes("igracias")) logoSrc = "/images/campus/igracias.png";
          return {
            title: l.name,
            description: l.description,
            href: l.url,
            logoSrc,
          };
        })
    : defaultLinks;

  if (layout === "grid") {
    return (
      <section className={cn("space-y-4 text-left", className)}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              {"// Akses Cepat"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {linksToRender.map((link) => (
            <QuickLinkCard
              key={link.title}
              title={link.title}
              description={link.description}
              href={link.href}
              logoSrc={link.logoSrc}
            />
          ))}
          {linksToRender.length === 0 && (
            <p className="col-span-full text-xs text-text-muted text-center py-4">
              Belum ada tautan aktif.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] p-4 sm:p-5 text-left shadow-xs",
        className
      )}
      aria-labelledby="quick-links-heading"
    >
      <header className="mb-3 sm:mb-3.5 space-y-0.5">
        <h2
          id="quick-links-heading"
          className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight"
        >
          {title}
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          {description}
        </p>
      </header>

      <div className="flex flex-col gap-2 sm:gap-2.5">
        {linksToRender.map((link) => (
          <QuickLinkCard
            key={link.title}
            title={link.title}
            description={link.description}
            href={link.href}
            logoSrc={link.logoSrc}
          />
        ))}

        {linksToRender.length === 0 && (
          <p className="text-xs text-text-muted text-center py-2">
            Belum ada tautan aktif.
          </p>
        )}
      </div>
    </section>
  );
}
