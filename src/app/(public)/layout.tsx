import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { getSettings } from "@/lib/data";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter settings={settings} />
    </>
  );
}
