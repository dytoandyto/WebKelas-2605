"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  emptyState?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  emptyState,
  className,
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--surface-primary)]/70 light:bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] select-none",
                    col.sortable &&
                      "cursor-pointer hover:text-[var(--text-primary)] transition-colors",
                    col.className
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-[var(--text-muted)]">
                        {sortColumn === col.key ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-[var(--text-muted)]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  {emptyState || (
                    <p className="text-sm text-[var(--text-muted)]">
                      Tidak ada data ditemukan
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const key = keyExtractor(row);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-white/[0.025]",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={`${key}-${col.key}`}
                        className={cn(
                          "px-4 py-3.5 text-sm text-[var(--text-primary)] align-middle",
                          col.className
                        )}
                      >
                        {col.cell
                          ? col.cell(row, index)
                          : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
