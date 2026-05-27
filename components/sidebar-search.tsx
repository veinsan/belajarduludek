"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SidebarSearch() {
  const router = useRouter();
  const [value, setValue] = React.useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors focus-within:border-primary/60 focus-within:bg-white/[0.07]"
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari topik, materi, soal"
        aria-label="Cari topik, materi, soal"
        className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
    </form>
  );
}
