import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SearchDialog } from "@/components/search-dialog";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | JS1SI-26-REG-05",
    default: "JS1SI-26-REG-05 | S1 Sistem Informasi Telkom University Jakarta",
  },
  description:
    "Academic class hub for S1 Sistem Informasi Telkom University Jakarta class JS1SI-26-REG-05 — schedules, coursework, learning materials, daily journal, cohort directory, and achievements.",
  keywords: [
    "Telkom University Jakarta",
    "S1 Sistem Informasi",
    "JS1SI-26-REG-05",
    "SI 26-05",
    "Academic Class Hub",
    "Class Schedule",
    "Class Journal",
    "Coursework",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <SearchDialog />
        </ThemeProvider>
      </body>
    </html>
  );
}

