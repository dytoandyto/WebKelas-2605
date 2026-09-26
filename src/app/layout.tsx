import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | ClassHub",
    default: "ClassHub — Informatics Engineering 2026",
  },
  description:
    "The official digital class hub and academic platform for Informatics Engineering Class A — tasks, schedules, achievements, students, and more.",
  keywords: ["classhub", "informatics", "class", "academic", "student", "schedule", "tasks"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
