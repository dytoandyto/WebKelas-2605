import React from "react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AdminHeader({ title, description, children }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-5 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold text-slate-900 tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-slate-500 text-sm mt-1 leading-normal max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
