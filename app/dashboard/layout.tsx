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
    <div className="dashboard-shell">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-white/[0.012]"
      />
      <aside className="dashboard-sidebar liquid-glass z-20 flex shrink-0 flex-col gap-5 rounded-none border-x-0 border-t-0 px-4 py-6 md:border-y-0 md:border-l-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3.5 py-3 transition-colors hover:bg-white/[0.07]"
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
      <main className="dashboard-main">
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
