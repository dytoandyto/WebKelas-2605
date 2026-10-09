"use client";

import * as React from "react";
import { QuickLinkCard } from "./quick-link-card";
import { cn } from "@/lib/utils";

export interface QuickLinksProps {
  className?: string;
}

export function QuickLinks({ className }: QuickLinksProps) {
  const campusLinks = [
    {
      title: "MyTelU",
      description: "Portal layanan Tel-U.",
      href: "https://satu.telkomuniversity.ac.id",
      logoSrc: "/images/campus/mytelu.png",
    },
    {
      title: "LMS Tel-U",
      description: "Materi dan pembelajaran.",
      href: "https://lms.telkomuniversity.ac.id/",
      logoSrc: "/images/campus/celoe.png",
    },
    {
      title: "iGracias",
      description: "Layanan akademik.",
      href: "https://igracias.telkomuniversity.ac.id",
      logoSrc: "/images/campus/igracias.png",
    },
  ];

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
          Akses Cepat Kampus
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Portal yang sering dibuka
        </p>
      </header>

      <div className="flex flex-col gap-2 sm:gap-2.5">
        {campusLinks.map((link) => (
          <QuickLinkCard
            key={link.title}
            title={link.title}
            description={link.description}
            href={link.href}
            logoSrc={link.logoSrc}
            external
          />
        ))}
      </div>
    </section>
  );
}
