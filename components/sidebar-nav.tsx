"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Home,
  Library,
  Monitor,
  PencilLine,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/kelas", label: "Kelas", icon: Monitor },
  { href: "/dashboard/gemini", label: "Gemini AI", icon: Bot },
  { href: "/dashboard/tryout", label: "Try Out", icon: PencilLine },
  { href: "/dashboard/materials", label: "Rangkuman", icon: Library },
];

const adminItem: NavItem = {
  href: "/dashboard/admin",
  label: "Admin",
  icon: ShieldCheck,
};

export function SidebarNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const navItems = isAdmin ? [...items, adminItem] : items;

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 rounded-lg px-2 py-2.5 text-base transition-colors",
              active
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon
              className="size-6 shrink-0"
              strokeWidth={active ? 2.4 : 1.9}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
