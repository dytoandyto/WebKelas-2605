import type { Metadata } from "next";
import { getActivityLogsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { LogsViewer } from "./logs-viewer";

export const metadata: Metadata = {
  title: "Activity Logs & System Audit",
  description: "Comprehensive audit trail and timeline of administrative actions in ClassHub.",
};

export default async function AdminLogsPage() {
  const { logs } = await getActivityLogsData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Activity Logs & Audit Trail"
        description="Immutable chronological record of administrative actions, content updates, and permission activities."
      />
      <div>
        <LogsViewer initialLogs={logs} />
      </div>
    </div>
  );
}
