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
      className="flex items-center gap-2 rounded-xl border border-border-strong bg-card/60 px-3.5 py-3 transition-colors focus-within:border-primary/50"
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
