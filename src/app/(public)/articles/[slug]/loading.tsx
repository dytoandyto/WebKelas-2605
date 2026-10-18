export default function ArticleDetailLoading() {
  return (
    <div className="min-h-screen pb-28 pt-28">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-64 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />

        {/* Header Skeleton */}
        <div className="space-y-4 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-12 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-5 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
          <div className="w-full aspect-[21/9] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse mt-4" />
        </div>

        {/* 2-Column Body Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-4">
          <div className="lg:col-span-8 2xl:col-span-9 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-6">
            <div className="h-6 w-1/2 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-32 w-full rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>

          <div className="lg:col-span-4 2xl:col-span-3 space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
