import React from "react";

export function ContentContainer({
  children,
  className = "",
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide" | "full";
}) {
  const maxWidth = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-[1440px]",
    full: "max-w-full",
  }[size];

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${maxWidth} ${className}`}>
      {children}
    </div>
  );
}

export function Surface({
  children,
  variant = "primary",
  className = "",
  as: Component = "div",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "glass" | "elevated";
  className?: string;
  as?: React.ElementType;
  [key: string]: any;
}) {
  const variantClass = {
    primary: "surface-primary",
    secondary: "surface-secondary",
    tertiary: "surface-tertiary",
    glass: "surface-glass",
    elevated: "surface-elevated",
  }[variant];

  return (
    <Component className={`${variantClass} ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function GlassPanel({
  children,
  className = "",
  glow = false,
  interactive = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
  [key: string]: any;
}) {
  return (
    <div
      className={`card card-glass ${interactive ? "card-interactive" : ""} ${
        glow ? "shadow-[0_0_25px_rgba(6,182,212,0.15)]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function PublicShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen cosmic-canvas flex flex-col ${className}`}>
      <main className="flex-1 pt-24 pb-16">{children}</main>
    </div>
  );
}

export function AdminShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen flex flex-col bg-[var(--bg-primary)] ${className}`}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1536px] w-full mx-auto">{children}</div>
    </div>
  );
}

export function AcademicPage({
  children,
  className = "",
  maxWidth = "max-w-4xl",
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <article
      className={`mx-auto w-full px-4 sm:px-6 py-6 font-sans text-[var(--text-primary)] ${maxWidth} ${className}`}
    >
      {children}
    </article>
  );
}
