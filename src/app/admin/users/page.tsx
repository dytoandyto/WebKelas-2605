import type { Metadata } from "next";
import { getUsersData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { UsersManager } from "./users-manager";

export const metadata: Metadata = {
  title: "User Accounts Management",
  description: "Manage administrators, lecturers, and class assistants.",
};

export default async function AdminUsersPage() {
  const { users } = await getUsersData();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        title="User & Access Management"
        description="Control team access, assign administrative roles, and manage credentials."
      />
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <UsersManager initialUsers={users} />
      </div>
    </div>
  );
}
