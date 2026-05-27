"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

export function SidebarUser({ name }: { name: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const trimmed = name.trim();
  const initial = (trimmed[0] ?? "U").toUpperCase();

  return (
    <div ref={ref} className="relative">
      {open ? (
        <div className="absolute inset-x-0 bottom-[calc(100%+10px)] animate-enter-up rounded-xl border border-border-strong bg-popover p-2 shadow-2xl">
          <button
            type="button"
            onClick={logout}
            disabled={pending}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-base font-semibold text-[#ef5a3c] transition-colors hover:bg-background disabled:opacity-50"
          >
            <LogOut className="size-5 shrink-0" />
            {pending ? "Keluar..." : "Logout"}
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.07]"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-[0_10px_28px_rgba(95,43,206,0.24)]">
          {initial}
        </span>
        <span className="flex-1 truncate text-sm font-semibold">{trimmed}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
    </div>
  );
}
