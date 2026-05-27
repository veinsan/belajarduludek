"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  CirclePlay,
  FileText,
  Film,
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

const TABS: { key: TabKey; label: string }[] = [
  { key: "deck", label: "Deck" },
  { key: "materi", label: "Materi" },
  { key: "jalur", label: "Jalur" },
];

type SubjectKey = "fisika" | "biologi" | "kimia" | "matematika";

const SUBJECTS: { key: SubjectKey; label: string }[] = [
  { key: "fisika", label: "Fisika" },
  { key: "biologi", label: "Biologi" },
  { key: "kimia", label: "Kimia" },
  { key: "matematika", label: "Matematika" },
];

type KelasVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
};

type VideoLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; videos: KelasVideo[] };

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
    <section className="flex min-w-0 flex-col gap-8">
      <div className="liquid-glass neon-edge rounded-[1.25rem] p-0">
        <VideoSection />
      </div>

      <div className="liquid-glass neon-edge flex min-w-0 flex-col gap-5 rounded-[1.25rem] p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg border border-primary-light/25 bg-primary/18 text-primary-light">
              <NotebookTabs className="size-4" />
            </span>
            <h2 className="text-lg font-extrabold tracking-tight md:text-xl">
              Deck, materi, dan jalur terakhir
            </h2>
          </div>
          <div
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-1"
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
                    "rounded-xl px-4 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    isActive
                      ? "bg-white/[0.1] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="scrollbar-hide flex max-w-full snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:px-6">
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

function VideoSection() {
  const [subject, setSubject] = React.useState<SubjectKey>("fisika");
  const [load, setLoad] = React.useState<VideoLoadState>({ status: "loading" });
  const panelId = "dashboard-video-panel";

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/kelas/videos?subject=${subject}`)
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          videos?: KelasVideo[];
        };
        if (cancelled) return;
        if (!res.ok || !data.videos) {
          setLoad({
            status: "error",
            message: data.error ?? "Gagal memuat video.",
          });
          return;
        }
        setLoad({ status: "ready", videos: data.videos });
      })
      .catch(() => {
        if (cancelled) return;
        setLoad({
          status: "error",
          message: "Tidak dapat terhubung ke server.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [subject]);

  function selectSubject(nextSubject: SubjectKey) {
    if (nextSubject === subject) return;
    setLoad({ status: "loading" });
    setSubject(nextSubject);
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg border border-primary-light/25 bg-primary/18 text-primary-light">
            <Film className="size-4" />
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Video Pelajaran
          </h2>
        </div>
        <Link
          href="/dashboard/kelas"
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-white/[0.09] hover:text-foreground"
        >
          Lihat semua
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div
        className="mx-5 mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/[0.045] p-1 md:mx-6 md:max-w-[720px] md:grid-cols-4"
        role="tablist"
        aria-label="Pilih mata pelajaran"
      >
        {SUBJECTS.map((s) => {
          const isActive = s.key === subject;
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => selectSubject(s.key)}
              className={cn(
                "flex justify-center rounded-xl px-4 py-2 text-center text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                isActive
                  ? "bg-white/[0.1] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-label={`Video ${subject}`}
        className="px-5 pb-6 pt-4 md:px-6"
      >
        {load.status === "loading" ? (
          <div className="scrollbar-hide flex max-w-full gap-5 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <VideoSkeleton key={i} />
            ))}
          </div>
        ) : load.status === "error" ? (
          <div className="liquid-card rounded-2xl p-5">
            <p className="text-sm font-semibold">Gagal memuat video</p>
            <p className="mt-1 text-sm text-muted-foreground">{load.message}</p>
          </div>
        ) : load.videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.045] p-5">
            <p className="text-sm font-semibold">Belum ada video</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Coba pilih mata pelajaran lain.
            </p>
          </div>
        ) : (
          <div className="scrollbar-hide flex max-w-full snap-x snap-mandatory gap-5 overflow-x-auto">
            {load.videos.map((video) => (
              <VideoCard key={video.videoId} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: KelasVideo }) {
  return (
    <Link
      href={`/dashboard/kelas/${video.videoId}`}
      className="group block w-[300px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="liquid-card flex h-full flex-col gap-0 overflow-hidden rounded-[1.1rem] p-0 transition-colors group-hover:border-white/20">
        <div className="relative aspect-video w-full overflow-hidden bg-elevated">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100"
          >
            <span className="flex size-11 items-center justify-center rounded-full border border-white/60 bg-black/50 text-white shadow-lg">
              <CirclePlay className="size-6" />
            </span>
          </span>
          <span className="absolute right-3 bottom-3 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white">
            10:27
          </span>
        </div>
        <div className="flex flex-col gap-1.5 p-4">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug">
            {video.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {video.channelTitle}
          </p>
        </div>
      </Card>
    </Link>
  );
}

function VideoSkeleton() {
  return (
    <div className="w-[300px] shrink-0">
      <Card className="liquid-card flex flex-col gap-0 overflow-hidden rounded-[1.35rem] p-0">
        <div className="aspect-video w-full animate-pulse bg-elevated" />
        <div className="flex flex-col gap-2 p-4">
          <div className="h-4 w-3/4 animate-pulse rounded bg-elevated" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-elevated" />
        </div>
      </Card>
    </div>
  );
}

function DeckCard({ deck }: { deck: DeckItem }) {
  return (
    <Link
      href={`/dashboard/decks/${deck.id}`}
      className="group block w-[260px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="liquid-card flex h-[160px] flex-col justify-between rounded-[1.35rem] p-5 transition-colors group-hover:border-white/20">
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
      <Card className="liquid-card flex h-[160px] flex-col justify-between rounded-[1.35rem] p-5 transition-colors group-hover:border-white/20">
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
      <Card className="liquid-card flex h-[160px] flex-col justify-between rounded-[1.35rem] p-5 transition-colors group-hover:border-white/20">
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
    <div className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-[1.35rem] border border-dashed border-white/15 bg-white/[0.045] p-5">
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
