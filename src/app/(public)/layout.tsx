import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { getSettings, getSubjectsData } from "@/lib/data";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, { subjects }] = await Promise.all([
    getSettings(),
    getSubjectsData(),
  ]);

  return (
    <>
      <PublicNavbar
        classCode={settings.classCode || "JS1SI-26-REG-05"}
        subjects={subjects}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter settings={settings} />
    </>
  );
}
