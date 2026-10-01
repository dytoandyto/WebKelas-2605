"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  CheckSquare,
  FileText,
  PenTool,
  Users,
  Trophy,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResults {
  tasks: any[];
  subjects: any[];
  materials: any[];
  dailyNotes: any[];
  students: any[];
  achievements: any[];
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    tasks: [],
    subjects: [],
    materials: [],
    dailyNotes: [],
    students: [],
    achievements: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut Ctrl+K or '/'
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((document.activeElement?.tagName || ""))
      ) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({
        tasks: [],
        subjects: [],
        materials: [],
        dailyNotes: [],
        students: [],
        achievements: [],
      });
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({
        tasks: [],
        subjects: [],
        materials: [],
        dailyNotes: [],
        students: [],
        achievements: [],
      });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResults =
    results.tasks.length +
    results.subjects.length +
    results.materials.length +
    results.dailyNotes.length +
    results.students.length +
    results.achievements.length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/20 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 bg-white dark:bg-[#081326] border-slate-200 dark:border-cyan-500/30 text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-label="Global Search"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-cyan-500/20 bg-slate-50/80 dark:bg-[#040914]/80">
          <Search size={18} className="text-blue-600 dark:text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, subjects, materials, daily notes, students..."
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
          />
          {loading && <Loader2 size={16} className="animate-spin text-blue-600 dark:text-cyan-400" />}
          {query && !loading && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded bg-slate-200 border border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {query.trim().length >= 2 && totalResults === 0 && !loading && (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Try searching by subject code, title, topic keyword, or student name.
              </p>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
              <Sparkles size={20} className="mx-auto mb-2 text-blue-500/60 dark:text-cyan-400/60" />
              <span>Type at least 2 characters to search across the academic hub.</span>
            </div>
          )}

          {/* Group 1: SUBJECTS */}
          {results.subjects.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={12} /> Subjects
                </span>
                <span className="text-[10px] font-mono text-slate-500">{results.subjects.length} results</span>
              </div>
              <div className="space-y-1">
                {results.subjects.map((s) => (
                  <Link
                    key={s.id}
                    href={`/subjects/${s.code}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-blue-100 text-blue-800 dark:bg-cyan-500/20 dark:text-cyan-300">
                          {s.code}
                        </span>
                        {s.name}
                      </div>
                      {s.englishName && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {s.englishName}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Group 2: TASKS */}
          {results.tasks.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckSquare size={12} /> Tasks & Coursework
                </span>
                <span className="text-[10px] font-mono text-slate-500">{results.tasks.length} results</span>
              </div>
              <div className="space-y-1">
                {results.tasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks?q=${encodeURIComponent(t.title)}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        {t.subject && <span>{t.subject.name}</span>}
                        {t.taskType && (
                          <span className="text-[9px] uppercase font-mono px-1 rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {t.taskType}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: MATERIALS */}
          {results.materials.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText size={12} /> Learning Materials
                </span>
                <span className="text-[10px] font-mono text-slate-500">{results.materials.length} results</span>
              </div>
              <div className="space-y-1">
                {results.materials.map((m) => (
                  <Link
                    key={m.id}
                    href={`/materials/${m.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                          {m.type}
                        </span>
                        {m.title}
                      </div>
                      {m.subject && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {m.subject.name}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Group 4: DAILY NOTES */}
          {results.dailyNotes.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <PenTool size={12} /> Daily Notes & Class Journal
                </span>
                <span className="text-[10px] font-mono text-slate-500">{results.dailyNotes.length} results</span>
              </div>
              <div className="space-y-1">
                {results.dailyNotes.map((n) => (
                  <Link
                    key={n.id}
                    href={`/daily-notes/${n.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                        {n.title}
                      </div>
                      {n.summary && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {n.summary}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Group 5: STUDENTS */}
          {results.students.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users size={12} /> Students
                </span>
                <span className="text-[10px] font-mono text-slate-500">{results.students.length} results</span>
              </div>
              <div className="space-y-1">
                {results.students.map((st) => (
                  <Link
                    key={st.id}
                    href={`/students/${st.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        NIM: {st.studentNumber || "-"} &bull; {st.major}
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Group 6: ACHIEVEMENTS */}
          {results.achievements.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Trophy size={12} /> Achievements
                </span>
                <span className="text-[10px] font-mono text-slate-500">{results.achievements.length} results</span>
              </div>
              <div className="space-y-1">
                {results.achievements.map((a) => (
                  <Link
                    key={a.id}
                    href={`/achievements#${a.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                        {a.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {a.organization || a.category}
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-cyan-500/10 bg-slate-50/80 dark:bg-[#040914]/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Ctrl + K</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">/</kbd> anywhere to open</span>
          </div>
          <span>ClassHub Academic Search</span>
        </div>
      </div>
    </div>
  );
}
