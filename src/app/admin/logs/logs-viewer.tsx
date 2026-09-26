"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  User as UserIcon,
  Clock,
  ShieldAlert,
  CheckCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface ActivityLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: Date | string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

interface LogsViewerProps {
  initialLogs: ActivityLogItem[];
}

export function LogsViewer({ initialLogs }: LogsViewerProps) {
  const [logs] = useState<ActivityLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("ALL");

  const entityTypes = [
    "ALL",
    "TASK",
    "SCHEDULE",
    "STUDENT",
    "SUBJECT",
    "ACHIEVEMENT",
    "ANNOUNCEMENT",
    "EVENT",
    "GALLERY",
    "RESOURCE",
    "USER",
    "SETTINGS",
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.user?.name && log.user.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (entityFilter !== "ALL" && log.entityType !== entityFilter) {
      return false;
    }

    return true;
  });

  function getActionBadge(action: string) {
    if (action.includes("CREATE") || action.includes("ADD")) {
      return "badge-green";
    }
    if (action.includes("UPDATE") || action.includes("EDIT")) {
      return "badge-blue";
    }
    if (action.includes("DELETE") || action.includes("REMOVE")) {
      return "badge-red";
    }
    if (action.includes("PUBLISH")) {
      return "badge-teal";
    }
    return "badge-gray";
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        {/* Entity Type Filter dropdown */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="input text-xs py-2"
          >
            {entityTypes.map((et) => (
              <option key={et} value={et}>
                {et === "ALL" ? "All Entities" : et}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table / Card List */}
      <div className="card overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <History size={26} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">No activity logs recorded</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              {searchQuery
                ? `No logs match "${searchQuery}". Try a different keyword.`
                : "Activity logs will automatically populate as administrative changes are performed."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4 sm:px-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => {
                  const actionBadge = getActionBadge(log.action);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                            {log.user?.name ? log.user.name.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs leading-none">
                              {log.user?.name || "System"}
                            </p>
                            {log.user?.role && (
                              <p className="text-[10px] text-slate-400 leading-none mt-1">
                                {log.user.role.replace("_", " ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={cn("badge text-xs font-semibold", actionBadge)}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono font-medium text-slate-600">
                        {log.entityType}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                        <span className="line-clamp-2">{log.details || "—"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
