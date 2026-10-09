import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProfileView } from "./profile-view";
import prisma from "@/lib/db";
import { initialUsers } from "@/lib/data/initial-data";

export const metadata: Metadata = {
  title: "Profil & Keamanan Akun",
  description: "Kelola data akun dan ubah kata sandi pengguna admin ClassHub.",
};

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.email.toLowerCase() },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
    }
  } catch {
    // Database connection error handling
  }

  const fallbackUser = initialUsers.find(
    (u) => u.id === session.id || u.email.toLowerCase() === session.email.toLowerCase()
  );

  const profileData = dbUser || {
    id: session.id,
    name: session.name || fallbackUser?.name || "User Admin",
    email: session.email || fallbackUser?.email || "admin@classhub.edu",
    role: session.role || fallbackUser?.role || ("CLASS_ADMIN" as const),
    isActive: true,
    createdAt: new Date(),
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Profil & Keamanan Akun"
        description="Informasi profil pengguna dan pembaharuan kata sandi akun administratif."
      />
      <div>
        <ProfileView user={profileData} />
      </div>
    </div>
  );
}
