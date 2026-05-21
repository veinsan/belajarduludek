"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  CirclePlay,
  FileText,
  GraduationCap,
  NotebookTabs,
  Route,
} from "lucide-react";

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
type VideoTabKey = "kelas" | "buku" | "kuis";

const TABS: { key: TabKey; label: string }[] = [
  { key: "deck", label: "Deck" },
  { key: "materi", label: "Materi" },
  { key: "jalur", label: "Jalur" },
];

const VIDEO_TABS: { key: VideoTabKey; label: string }[] = [
  { key: "kelas", label: "Kelas" },
  { key: "buku", label: "Buku" },
  { key: "kuis", label: "Kuis" },
];

const VIDEO_PLACEHOLDERS: Record<
  VideoTabKey,
  {
    title: string;
    subject: string;
    progress: number;
    accent: string;
    thumbnailClass: string;
  }[]
> = {
  kelas: [
    {
      title: "Teorema Fundamental Kalkulus II",
      subject: "Kalkulus 1",
      progress: 98,
      accent: "bg-emerald-400",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_24%_28%,rgba(34,197,94,0.42),transparent_28%),linear-gradient(135deg,#25313d,#111827_54%,#020617)]",
    },
    {
      title: "Energi Foton",
      subject: "Kimia Dasar 1",
      progress: 82,
      accent: "bg-amber-300",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_72%_28%,rgba(250,204,21,0.36),transparent_30%),linear-gradient(135deg,#1e1b4b,#0f172a_48%,#111827)]",
    },
    {
      title: "Pusat Massa & Sistem Partikel",
      subject: "Fisika Dasar 1",
      progress: 19,
      accent: "bg-sky-300",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_34%_24%,rgba(56,189,248,0.38),transparent_30%),linear-gradient(135deg,#172554,#18181b_58%,#030712)]",
    },
    {
      title: "Apa yang Akan Kita Pelajari dalam Pengantar",
      subject: "Pengantar Akademik",
      progress: 56,
      accent: "bg-rose-300",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_76%_34%,rgba(251,113,133,0.34),transparent_32%),linear-gradient(135deg,#3f1d2f,#27272a_52%,#09090b)]",
    },
  ],
  buku: [
    {
      title: "Membaca Cepat Bab Turunan",
      subject: "Buku Kalkulus",
      progress: 64,
      accent: "bg-violet-300",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_70%_22%,rgba(167,139,250,0.44),transparent_30%),linear-gradient(135deg,#312e81,#1f2937_56%,#0b1020)]",
    },
    {
      title: "Inti Bab Ikatan Kimia",
      subject: "Buku Kimia",
      progress: 41,
      accent: "bg-cyan-300",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_28%_30%,rgba(103,232,249,0.38),transparent_32%),linear-gradient(135deg,#164e63,#1f2937_52%,#020617)]",
    },
    {
      title: "Ringkasan Momentum Linear",
      subject: "Buku Fisika",
      progress: 73,
      accent: "bg-lime-300",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_72%_26%,rgba(190,242,100,0.32),transparent_30%),linear-gradient(135deg,#365314,#1f2937_54%,#09090b)]",
    },
  ],
  kuis: [
    {
      title: "Pembahasan Kuis Limit Fungsi",
      subject: "Drill Matematika",
      progress: 88,
      accent: "bg-fuchsia-300",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_70%_28%,rgba(240,171,252,0.34),transparent_30%),linear-gradient(135deg,#581c87,#1f2937_54%,#09090b)]",
    },
    {
      title: "Kuis Cepat Stoikiometri",
      subject: "Drill Kimia",
      progress: 35,
      accent: "bg-orange-300",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_32%_24%,rgba(253,186,116,0.38),transparent_31%),linear-gradient(135deg,#7c2d12,#27272a_56%,#09090b)]",
    },
    {
      title: "Evaluasi Gaya dan Gerak",
      subject: "Drill Fisika",
      progress: 52,
      accent: "bg-blue-300",
      thumbnailClass:
        "bg-[radial-gradient(circle_at_74%_34%,rgba(147,197,253,0.36),transparent_32%),linear-gradient(135deg,#1d4ed8,#1f2937_52%,#020617)]",
    },
  ],
};

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
  const [activeVideoTab, setActiveVideoTab] =
    React.useState<VideoTabKey>("kelas");
  const visibleVideos = VIDEO_PLACEHOLDERS[activeVideoTab];

  return (
    <section className="flex flex-col gap-16">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          Lanjut Belajar, Yuk!
        </h2>

        <div
          className="grid grid-cols-3 border-b border-border"
          role="tablist"
          aria-label="Pilih video penjelasan"
        >
          {VIDEO_TABS.map((tab) => {
            const isActive = tab.key === activeVideoTab;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveVideoTab(tab.key)}
                className={cn(
                  "-mb-px flex justify-center border-b-2 px-4 py-2 text-center text-sm font-semibold transition-colors",
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

        <div className="scrollbar-hide -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-1 md:-mx-3 md:px-3">
          {visibleVideos.map((video) => (
            <VideoPlaceholderCard key={video.title} video={video} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-light">
              Koleksi belajarmu
            </p>
            <h3 className="text-lg font-extrabold tracking-tight md:text-xl">
              Deck, materi, dan jalur terakhir
            </h3>
          </div>
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

        <div className="scrollbar-hide -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-1 md:-mx-3 md:px-3">
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
      </div>
    </section>
  );
}

function VideoPlaceholderCard({
  video,
}: {
  video: (typeof VIDEO_PLACEHOLDERS)[VideoTabKey][number];
}) {
  return (
    <article className="group grid h-[190px] w-[360px] shrink-0 snap-start grid-cols-[150px_minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-border-strong hover:bg-elevated sm:w-[455px] sm:grid-cols-[182px_minmax(0,1fr)]">
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          video.thumbnailClass
        )}
      >
        <div className="absolute inset-x-4 top-5 h-px bg-foreground/30" />
        <div className="absolute left-5 top-9 h-px w-16 bg-foreground/25" />
        <div className="absolute bottom-6 left-5 h-px w-20 bg-foreground/20" />
        <span className="absolute right-4 top-4 flex size-3 rounded-full bg-foreground/70" />
        <span className={cn("absolute bottom-5 right-5 size-8 rounded-full", video.accent)} />
        <span className="relative flex size-11 items-center justify-center rounded-full border border-white/50 bg-black/45 text-white shadow-lg transition-transform group-hover:scale-105">
          <CirclePlay className="size-7" aria-hidden />
          <span className="sr-only">Putar video</span>
        </span>
      </div>

      <div className="flex min-w-0 flex-col justify-between p-5">
        <div className="flex flex-col gap-3">
          <span className="w-fit rounded-full bg-yellow-400/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-300">
            In Progress - {video.progress}%
          </span>
          <h4 className="line-clamp-3 text-lg font-extrabold leading-snug">
            {video.title}
          </h4>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <GraduationCap className="size-3.5 text-primary-light" aria-hidden />
            <span className="truncate">{video.subject}</span>
          </p>
        </div>
        <span className="w-fit rounded-full bg-elevated px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
          Video
        </span>
      </div>
    </article>
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
          <span className="flex w-fit items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
            <NotebookTabs className="size-3" aria-hidden />
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
            <span className="flex w-fit items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
              <BookOpen className="size-3" aria-hidden />
              Diringkas
            </span>
          ) : (
            <span className="flex w-fit items-center gap-1 rounded-full border border-border-strong px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <FileText className="size-3" aria-hidden />
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
          <span className="flex w-fit items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
            <Route className="size-3" aria-hidden />
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
