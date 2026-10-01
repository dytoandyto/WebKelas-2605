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
    <div className="space-y-6">
      <AdminHeader
        title="User & Access Management"
        description="Control team access, assign administrative roles, and manage credentials."
      />
      <div>
        <UsersManager initialUsers={users} />
      </div>
    </div>
  );
}
