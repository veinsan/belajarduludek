"use client";

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; videos: KelasVideo[] };

export function KelasBrowser() {
  const [subject, setSubject] = React.useState<SubjectKey>("fisika");
  const [load, setLoad] = React.useState<LoadState>({ status: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    setLoad({ status: "loading" });
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

  return (
    <div className="flex flex-col gap-6">
      <nav
        className="scrollbar-hide flex gap-2 overflow-x-auto"
        aria-label="Pilih mata pelajaran"
      >
        {SUBJECTS.map((s) => {
          const active = s.key === subject;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSubject(s.key)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "border border-border-strong bg-card text-muted-foreground hover:bg-elevated hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      {load.status === "loading" ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <Card className="overflow-hidden p-0">
                <div className="aspect-video w-full animate-pulse bg-elevated" />
                <div className="flex flex-col gap-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-elevated" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-elevated" />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : load.status === "error" ? (
        <Card className="p-6">
          <p className="text-sm font-semibold">Gagal memuat video</p>
          <p className="mt-1 text-sm text-muted-foreground">{load.message}</p>
        </Card>
      ) : load.videos.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm font-semibold">Belum ada video</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Coba pilih mata pelajaran lain.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {load.videos.map((video) => (
            <li key={video.videoId}>
              <Link
                href={`/dashboard/kelas/${video.videoId}`}
                className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <Card className="flex h-full flex-col overflow-hidden p-0 transition-colors group-hover:border-border-strong group-hover:bg-elevated">
                  <div className="aspect-video w-full overflow-hidden bg-elevated">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnail}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {video.channelTitle}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
