import { ContentContainer } from "@/components/shared";

export default function ArticlesLoading() {
  return (
    <div className="min-h-screen pb-24 pt-28">
      <ContentContainer>
        {/* Header Skeleton */}
        <div className="space-y-3 mb-8">
          <div className="h-6 w-36 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-10 w-72 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-96 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="h-11 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-11 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-11 w-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-11 w-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 overflow-hidden"
            >
              <div className="h-44 w-full rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </ContentContainer>
    </div>
  );
}
