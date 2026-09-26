import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { AdminLayoutClient } from "./layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const session = await getSession();

  // Either user from DB or valid session fallback
  const activeUser = user || session;

  if (!activeUser) {
    redirect("/login");
  }

  if (!hasPermission(activeUser.role, "VIEW_ADMIN")) {
    redirect("/login");
  }

  return (
    <AdminLayoutClient user={activeUser}>
      {children}
    </AdminLayoutClient>
  );
}
