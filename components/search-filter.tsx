"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "soal", label: "Latihan Soal" },
  { value: "materi", label: "Materi" },
  { value: "path", label: "Learning Path" },
] as const;

const SORT_OPTIONS = [
  { value: "relevan", label: "Paling Relevan" },
  { value: "terbaru", label: "Terakhir Dirilis" },
  { value: "populer", label: "Paling Populer" },
] as const;

export function SearchFilter({
  q,
  type,
  sort,
}: {
  q: string;
  type: string;
  sort: string;
}) {
  const router = useRouter();
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);
  const typeRef = React.useRef<HTMLDivElement | null>(null);
  const sortRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (typeRef.current && !typeRef.current.contains(target)) {
        setTypeOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const currentType =
    TYPE_OPTIONS.find((o) => o.value === type) ?? TYPE_OPTIONS[0];
  const currentSort =
    SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  function navigate(nextType: string, nextSort: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextType !== "all") params.set("type", nextType);
    if (nextSort !== "relevan") params.set("sort", nextSort);
    const query = params.toString();
    router.push(`/dashboard/search${query ? `?${query}` : ""}`);
  }

  return (
    <div className="flex items-center gap-3">
      {/* type filter */}
      <div ref={typeRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setSortOpen(false);
            setTypeOpen((o) => !o);
          }}
          aria-expanded={typeOpen}
          className="flex min-w-[200px] items-center justify-between gap-3 rounded-full border border-border-strong bg-card/60 px-5 py-3 text-sm font-semibold transition-colors hover:bg-elevated"
        >
          {currentType.label}
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              typeOpen && "rotate-180"
            )}
          />
        </button>
        {typeOpen ? (
          <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[220px] animate-enter-up overflow-hidden rounded-2xl border border-border-strong bg-popover p-2 shadow-2xl">
            {TYPE_OPTIONS.map((o) => {
              const active = o.value === currentType.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    setTypeOpen(false);
                    navigate(o.value, sort);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-elevated",
                    active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {o.label}
                  {active ? (
                    <Check className="size-4 shrink-0 text-muted-foreground" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* sort — opened from the filter icon */}
      <div ref={sortRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setTypeOpen(false);
            setSortOpen((o) => !o);
          }}
          aria-label="Urutkan hasil"
          aria-expanded={sortOpen}
          className="flex size-11 items-center justify-center rounded-full border border-border-strong bg-card/60 text-muted-foreground transition-colors hover:bg-elevated aria-expanded:bg-elevated aria-expanded:text-foreground"
        >
          <SlidersHorizontal className="size-4" />
        </button>
        {sortOpen ? (
          <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[240px] animate-enter-up overflow-hidden rounded-2xl border border-border-strong bg-popover p-2 shadow-2xl">
            {SORT_OPTIONS.map((o) => {
              const active = o.value === currentSort.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    setSortOpen(false);
                    navigate(type, o.value);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-elevated",
                    active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {o.label}
                  {active ? (
                    <Check className="size-4 shrink-0 text-muted-foreground" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
