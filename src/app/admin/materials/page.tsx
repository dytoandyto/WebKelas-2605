import type { Metadata } from "next";
import { getMaterialsData } from "@/lib/data";
import { AdminHeader } from "@/components/admin/admin-header";
import { MaterialsManager } from "./materials-manager";

export const metadata: Metadata = {
  title: "Materials Management | Admin JS1SI-26-REG-05",
  description: "Kelola repositori materi perkuliahan, slide, dan dokumen modul kelas.",
};

export default async function AdminMaterialsPage() {
  const { materials, subjects } = await getMaterialsData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Repositori Materi Kuliah"
        description="Kelola berkas materi perkuliahan, link Google Drive, modul praktikum, dan referensi akademik per mata kuliah."
      />
      <div className="max-w-7xl mx-auto">
        <MaterialsManager
          initialMaterials={materials as any}
          subjects={subjects as any}
        />
      </div>
    </div>
  );
}
