"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/kelas", label: "Kelas" },
  { href: "/dashboard/gemini", label: "Gemini AI" },
  { href: "/dashboard/tryout", label: "Try Out" },
  { href: "/dashboard/rangkum", label: "Rangkum Materi" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-primary transition-all",
                active ? "w-1 opacity-100" : "w-0 opacity-0"
              )}
            />
            <span className="ml-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
