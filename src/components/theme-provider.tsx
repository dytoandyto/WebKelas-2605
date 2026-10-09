"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Suppress benign React 19 / Next.js 16 script tag warning emitted by next-themes' inline FOUC prevention script.
// In React 19, inline scripts inside components trigger this warning during client rendering even though
// the script correctly executes during initial HTML parsing to prevent theme flash (FOUC).
if (
  typeof console !== "undefined" &&
  !(console as unknown as { __scriptWarningPatched?: boolean }).__scriptWarningPatched
) {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
  (console as unknown as { __scriptWarningPatched?: boolean }).__scriptWarningPatched = true;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
