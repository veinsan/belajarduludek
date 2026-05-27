import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarSearch } from "@/components/sidebar-search";
import { SidebarUser } from "@/components/sidebar-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-5 border-b bg-sidebar px-4 py-6 md:sticky md:top-0 md:h-screen md:w-[224px] md:border-r md:border-b-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-sm border border-border-strong bg-card/60 px-3.5 py-3 transition-colors hover:bg-elevated"
        >
          <span className="whitespace-nowrap text-sm font-extrabold tracking-tight">
            BelajarDuluDek
          </span>
          <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            SMA
          </span>
        </Link>

        <SidebarSearch />

        <SidebarNav isAdmin={session.role === "SUPERADMIN"} />

        <div className="mt-auto">
          <SidebarUser name={session.name} />
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-12 md:py-10 xl:px-14">
        <div className="mx-auto w-full max-w-[1628px]">{children}</div>
      </main>
    </div>
  );
}
