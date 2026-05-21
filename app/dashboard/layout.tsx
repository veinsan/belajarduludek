import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { AiChat } from "@/components/ai-chat";
import { SidebarNav } from "@/components/sidebar-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-7 border-b bg-sidebar px-6 py-6 md:sticky md:top-0 md:h-screen md:w-[300px] md:border-r md:border-b-0 md:px-7 md:py-7">
        <Link
          href="/dashboard"
          className="text-base font-extrabold tracking-tight"
        >
          BelajarDuluDek
        </Link>
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-3 border-t border-sidebar-border pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Masuk sebagai
            </span>
            <span className="truncate text-sm font-medium">
              {session.name}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-12 md:py-10 xl:px-14">
        <div className="mx-auto w-full max-w-[1628px]">{children}</div>
      </main>
      <AiChat />
    </div>
  );
}
