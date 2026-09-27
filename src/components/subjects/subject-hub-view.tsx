"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  BookMarked,
  FileText,
  Clock,
  MapPin,
  User,
  ExternalLink,
  Download,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn, formatDate, getRelativeDeadline } from "@/lib/utils";

interface SubjectHubViewProps {
  subject: any;
}

export function SubjectHubView({ subject }: SubjectHubViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "tasks" | "materials" | "notes">("overview");

  const schedules = subject.schedules || [];
  const tasks = subject.tasks || [];
  const materials = subject.materials || [];
  const dailyNotes = subject.dailyNotes || [];

  const tabs = [
    { key: "overview", label: "Overview", count: null },
    { key: "schedule", label: "Jadwal", count: schedules.length },
    { key: "tasks", label: "Tugas", count: tasks.length },
    { key: "materials", label: "Materi", count: materials.length },
    { key: "notes", label: "Catatan Harian", count: dailyNotes.length },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Subject Header Card */}
      <div className="card p-6 sm:p-8 bg-[#08152e]/90 light:bg-white border-cyan-500/25 light:border-slate-200 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-cyan-500/15 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 font-mono text-sm font-extrabold">
              {subject.code}
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700 text-xs font-mono font-bold">
              {subject.sks || 3} SKS
            </span>
          </div>

          <div className="text-xs text-slate-400 light:text-slate-500 font-mono">
            Semester Ganjil 2026/2027
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white light:text-slate-900 font-display">
            {subject.name}
          </h1>
          {subject.englishName && (
            <p className="text-sm sm:text-base text-slate-400 light:text-slate-500 italic mt-1">
              {subject.englishName}
            </p>
          )}
        </div>

        {subject.lecturerName && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 light:text-slate-700 pt-2 border-t border-cyan-500/15 light:border-slate-100">
            <User size={15} className="text-cyan-400 light:text-blue-600" />
            <span>Dosen Pengampu: <strong className="text-white light:text-slate-900">{subject.lecturerName}</strong></span>
          </div>
        )}

        {subject.description && (
          <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 leading-relaxed pt-1">
            {subject.description}
          </p>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-cyan-500/20 light:border-slate-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md border border-cyan-300/40"
                  : "bg-[#08152e]/70 light:bg-white text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 border border-cyan-500/15 light:border-slate-200"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-white/5 light:bg-slate-100 text-slate-400 light:text-slate-600"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 light:text-slate-500">Jadwal Sesi</span>
                <div className="text-2xl font-black text-white light:text-slate-900">{schedules.length} Sesi</div>
              </div>
              <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 light:text-slate-500">Tugas Aktif</span>
                <div className="text-2xl font-black text-white light:text-slate-900">{tasks.length} Tugas</div>
              </div>
              <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 light:text-slate-500">Materi Terunggah</span>
                <div className="text-2xl font-black text-white light:text-slate-900">{materials.length} Berkas</div>
              </div>
              <div className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 light:text-slate-500">Catatan Jurnal</span>
                <div className="text-2xl font-black text-white light:text-slate-900">{dailyNotes.length} Entri</div>
              </div>
            </div>

            {/* Quick snapshot sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Tasks preview */}
              <div className="card p-6 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
                    <CheckSquare size={16} className="text-teal-400" />
                    <span>Tugas Mendatang</span>
                  </h3>
                  <button onClick={() => setActiveTab("tasks")} className="text-xs text-cyan-400 light:text-blue-600 hover:underline">
                    Lihat Semua &rarr;
                  </button>
                </div>
                {tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.slice(0, 3).map((t: any) => (
                      <Link
                        key={t.id}
                        href={`/tasks/${t.id}`}
                        className="block p-3 rounded-xl bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 hover:border-cyan-400/40 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-white light:text-slate-900 mb-1">
                          <span>{t.title}</span>
                          <span className="text-[10px] font-mono text-cyan-300 light:text-blue-700">[{t.taskType || "INDIVIDUAL"}]</span>
                        </div>
                        <div className="text-[11px] text-slate-400 light:text-slate-500 font-mono">
                          Tenggat: {formatDate(t.deadline)}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 light:text-slate-500">Tidak ada tugas aktif untuk mata kuliah ini.</p>
                )}
              </div>

              {/* Latest Materials preview */}
              <div className="card p-6 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
                    <BookMarked size={16} className="text-purple-400" />
                    <span>Materi Terbaru</span>
                  </h3>
                  <button onClick={() => setActiveTab("materials")} className="text-xs text-cyan-400 light:text-blue-600 hover:underline">
                    Lihat Semua &rarr;
                  </button>
                </div>
                {materials.length > 0 ? (
                  <div className="space-y-2">
                    {materials.slice(0, 3).map((m: any) => (
                      <Link
                        key={m.id}
                        href={`/materials/${m.id}`}
                        className="block p-3 rounded-xl bg-[#040813]/60 light:bg-slate-50 border border-cyan-500/15 light:border-slate-200 hover:border-cyan-400/40 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-white light:text-slate-900 mb-1">
                          <span className="truncate">{m.title}</span>
                          <span className="text-[10px] font-mono text-purple-300 light:text-purple-700 uppercase">[{m.type}]</span>
                        </div>
                        <div className="text-[11px] text-slate-400 light:text-slate-500 font-mono">
                          {formatDate(m.createdAt)}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 light:text-slate-500">Belum ada materi perkuliahan terunggah.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            {schedules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules.map((sch: any) => (
                  <div
                    key={sch.id}
                    className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg bg-cyan-500/15 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 font-mono text-xs font-bold uppercase">
                        {sch.dayOfWeek}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300 light:text-blue-700">
                        {sch.startTime} - {sch.endTime} WIB
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs text-slate-300 light:text-slate-700 font-mono">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-cyan-400 light:text-blue-600" />
                        <span>Ruangan: <strong>{sch.room || "-"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-cyan-400 light:text-blue-600" />
                        <span>Dosen: {sch.lecturerName || subject.lecturerName || "-"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center border-dashed border-cyan-500/20 light:border-slate-200 bg-[#08152e]/40 light:bg-slate-50 text-xs text-slate-400 light:text-slate-600">
                Tidak ada data jadwal kuliah tersimpan untuk mata kuliah ini.
              </div>
            )}
          </div>
        )}

        {/* 3. TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/15 light:bg-blue-50 text-blue-300 light:text-blue-700">
                        {t.taskType || "INDIVIDUAL"}
                      </span>
                      <span className="text-xs font-mono text-cyan-300 light:text-blue-700">
                        Tenggat: {formatDate(t.deadline)}
                      </span>
                    </div>
                    <h4 className="font-bold text-white light:text-slate-900 text-sm leading-snug">{t.title}</h4>
                    {t.description && (
                      <p className="text-xs text-slate-300 light:text-slate-600 line-clamp-2">{t.description}</p>
                    )}
                    <div className="pt-2 border-t border-cyan-500/15 light:border-slate-100 flex justify-end">
                      <Link
                        href={`/tasks/${t.id}`}
                        className="text-xs text-cyan-400 light:text-blue-600 font-bold hover:underline"
                      >
                        Buka Detail Tugas &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center border-dashed border-cyan-500/20 light:border-slate-200 bg-[#08152e]/40 light:bg-slate-50 text-xs text-slate-400 light:text-slate-600">
                Belum ada tugas untuk mata kuliah ini.
              </div>
            )}
          </div>
        )}

        {/* 4. MATERIALS TAB */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            {materials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((m: any) => (
                  <div
                    key={m.id}
                    className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 light:bg-purple-50 text-purple-300 light:text-purple-700">
                        {m.type}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 light:text-slate-500">{formatDate(m.createdAt)}</span>
                    </div>
                    <h4 className="font-bold text-white light:text-slate-900 text-sm leading-snug">{m.title}</h4>
                    {m.description && (
                      <p className="text-xs text-slate-300 light:text-slate-600 line-clamp-2">{m.description}</p>
                    )}
                    <div className="pt-2 border-t border-cyan-500/15 light:border-slate-100 flex justify-end">
                      <Link
                        href={`/materials/${m.id}`}
                        className="text-xs text-cyan-400 light:text-blue-600 font-bold hover:underline"
                      >
                        Buka Halaman Studi &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center border-dashed border-cyan-500/20 light:border-slate-200 bg-[#08152e]/40 light:bg-slate-50 text-xs text-slate-400 light:text-slate-600">
                Belum ada materi yang diunggah untuk mata kuliah ini.
              </div>
            )}
          </div>
        )}

        {/* 5. NOTES TAB */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            {dailyNotes.length > 0 ? (
              <div className="space-y-3">
                {dailyNotes.map((n: any) => (
                  <div
                    key={n.id}
                    className="card p-5 bg-[#08152e]/80 light:bg-white border-cyan-500/20 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-[11px] font-mono text-cyan-300 light:text-blue-600 font-bold mb-1">
                        {formatDate(n.date)}
                      </div>
                      <h4 className="font-bold text-white light:text-slate-900 text-sm">{n.title}</h4>
                      {n.summary && (
                        <p className="text-xs text-slate-300 light:text-slate-600 line-clamp-1 mt-0.5">{n.summary}</p>
                      )}
                    </div>
                    <Link
                      href={`/daily-notes/${n.id}`}
                      className="btn btn-secondary btn-sm whitespace-nowrap self-start sm:self-center"
                    >
                      <span>Baca Catatan</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center border-dashed border-cyan-500/20 light:border-slate-200 bg-[#08152e]/40 light:bg-slate-50 text-xs text-slate-400 light:text-slate-600">
                Belum ada catatan harian untuk mata kuliah ini.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
