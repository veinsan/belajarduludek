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

type AdminClass = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  videoId: string | null;
  thumbnailUrl: string | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; videos: KelasVideo[] };

export function KelasBrowser({
  adminClasses = [],
}: {
  adminClasses?: AdminClass[];
}) {
  const [subject, setSubject] = React.useState<SubjectKey>("fisika");
  const [load, setLoad] = React.useState<LoadState>({ status: "loading" });

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
    <div className="flex flex-col gap-6">
      {adminClasses.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">
              Kelas dari admin
            </h2>
            <p className="text-xs text-muted-foreground">
              Materi pilihan yang ditambahkan admin.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminClasses.map((item, index) => (
              <li
                key={item.id}
                className="animate-enter-up"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <Link
                  href={`/dashboard/kelas/custom/${item.id}`}
                  className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <Card className="flex h-full flex-col overflow-hidden p-0 transition-all group-hover:-translate-y-1 group-hover:border-border-strong group-hover:bg-elevated">
                    <div className="aspect-video w-full overflow-hidden bg-elevated">
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 px-6 text-center text-sm font-semibold text-primary">
                          {item.subject}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {item.subject}
                      </p>
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug">
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
              onClick={() => selectSubject(s.key)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "scale-[1.02] bg-primary text-primary-foreground shadow-[0_10px_28px_rgba(95,43,206,0.25)]"
                  : "border border-border-strong bg-card text-muted-foreground hover:-translate-y-0.5 hover:bg-elevated hover:text-foreground"
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
            <li
              key={i}
              className="animate-enter-up"
              style={{ animationDelay: `${i * 55}ms` }}
            >
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
        <ul key={subject} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {load.videos.map((video, index) => (
            <li
              key={video.videoId}
              className="animate-enter-up"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <Link
                href={`/dashboard/kelas/${video.videoId}`}
                className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <Card className="flex h-full flex-col overflow-hidden p-0 transition-all group-hover:-translate-y-1 group-hover:border-border-strong group-hover:bg-elevated">
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
