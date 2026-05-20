"use client";

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type DeckItem = {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
};

type MaterialItem = {
  id: string;
  title: string;
  createdAt: Date;
  hasSummary: boolean;
};

type PathItem = {
  id: string;
  title: string;
  stepCount: number;
};

type TabKey = "deck" | "materi" | "jalur";

const TABS: { key: TabKey; label: string }[] = [
  { key: "deck", label: "Deck" },
  { key: "materi", label: "Materi" },
  { key: "jalur", label: "Jalur" },
];

export function DashboardTabs({
  decks,
  materials,
  paths,
}: {
  decks: DeckItem[];
  materials: MaterialItem[];
  paths: PathItem[];
}) {
  const [active, setActive] = React.useState<TabKey>("deck");

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">
          Lanjut Belajar, Yuk!
        </h2>
        <div
          className="flex gap-1 border-b border-border"
          role="tablist"
          aria-label="Pilih jenis konten"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.key)}
                className={cn(
                  "-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:-mx-10 md:px-10">
        {active === "deck" ? (
          decks.length === 0 ? (
            <EmptySlot
              title="Belum ada deck"
              description="Bikin flashcard untuk drill materi."
              ctaHref="/dashboard/decks/new"
              ctaLabel="Buat deck"
            />
          ) : (
            decks.map((deck) => <DeckCard key={deck.id} deck={deck} />)
          )
        ) : null}
        {active === "materi" ? (
          materials.length === 0 ? (
            <EmptySlot
              title="Belum ada materi"
              description="Simpan catatan atau ringkasan pelajaran."
              ctaHref="/dashboard/materials/new"
              ctaLabel="Tambah materi"
            />
          ) : (
            materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))
          )
        ) : null}
        {active === "jalur" ? (
          paths.length === 0 ? (
            <EmptySlot
              title="Belum ada jalur"
              description="Urutkan deck jadi jalur belajar bertahap."
              ctaHref="/dashboard/paths/new"
              ctaLabel="Buat jalur"
            />
          ) : (
            paths.map((path) => <PathCard key={path.id} path={path} />)
          )
        ) : null}
      </div>
    </section>
  );
}

function DeckCard({ deck }: { deck: DeckItem }) {
  return (
    <Link
      href={`/dashboard/decks/${deck.id}`}
      className="group block w-[260px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="flex h-[160px] flex-col justify-between p-5 transition-colors group-hover:border-border-strong group-hover:bg-elevated">
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
            Deck
          </span>
          <p className="line-clamp-2 text-base font-bold leading-snug">
            {deck.title}
          </p>
          {deck.description ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {deck.description}
            </p>
          ) : null}
        </div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {deck.cardCount} kartu
        </p>
      </Card>
    </Link>
  );
}

function MaterialCard({ material }: { material: MaterialItem }) {
  return (
    <Link
      href={`/dashboard/materials/${material.id}`}
      className="group block w-[260px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="flex h-[160px] flex-col justify-between p-5 transition-colors group-hover:border-border-strong group-hover:bg-elevated">
        <div className="flex flex-col gap-2">
          {material.hasSummary ? (
            <span className="w-fit rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
              Diringkas
            </span>
          ) : (
            <span className="w-fit rounded-full border border-border-strong px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Belum diringkas
            </span>
          )}
          <p className="line-clamp-2 text-base font-bold leading-snug">
            {material.title}
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {dateFormatter.format(material.createdAt)}
        </p>
      </Card>
    </Link>
  );
}

function PathCard({ path }: { path: PathItem }) {
  return (
    <Link
      href={`/dashboard/paths/${path.id}`}
      className="group block w-[260px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="flex h-[160px] flex-col justify-between p-5 transition-colors group-hover:border-border-strong group-hover:bg-elevated">
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
            Jalur
          </span>
          <p className="line-clamp-2 text-base font-bold leading-snug">
            {path.title}
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {path.stepCount} langkah
        </p>
      </Card>
    </Link>
  );
}

function EmptySlot({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-xl border border-dashed border-border-strong bg-card/40 p-5">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Link
        href={ctaHref}
        className="mt-3 inline-flex w-fit items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
