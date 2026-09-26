import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
    template: "%s | Information Systems 26",
    default: "Information Systems 26 — Build. Learn. Create.",
  },
  description:
    "Official academic platform and digital hub for Information Systems 26 — schedules, tasks, coursework, cohort directory, achievements, and resources.",
  keywords: [
    "information systems",
    "systems 26",
    "academic portal",
    "class hub",
    "cohort",
    "schedule",
    "tasks",
    "informatics",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} dark`}>
      <body className="min-h-screen flex flex-col antialiased bg-[#060b17] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
