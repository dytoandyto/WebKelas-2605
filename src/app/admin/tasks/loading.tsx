import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTasksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-cyan-500/15">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Quick Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-52 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Tasks Table Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-cyan-500/20 bg-white dark:bg-[#081326] overflow-hidden shadow-xs">
        <div className="h-11 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-cyan-500/15 px-6 flex items-center justify-between">
          <Skeleton className="h-3.5 w-36 rounded" />
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-3.5 w-20 rounded" />
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 max-w-md">
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-3 w-3/5 rounded" />
              </div>
              <Skeleton className="h-6 w-24 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
