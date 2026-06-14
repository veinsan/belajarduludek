"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; explanation: string };

export function KelasExplanation({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  // State kembali ke "loading" lewat remount: pemanggil wajib memberi
  // key={videoId} agar komponen ini di-reset saat pindah video.
  const [load, setLoad] = React.useState<LoadState>({ status: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/kelas/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, title }),
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          explanation?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.explanation) {
          setLoad({
            status: "error",
            message: data.error ?? "Gagal memuat penjelasan.",
          });
          return;
        }
        setLoad({ status: "ready", explanation: data.explanation });
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
  }, [videoId, title]);

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
          AI · Gemini
        </span>
        <h2 className="text-base font-bold tracking-tight">
          Penjelasan tambahan
        </h2>
      </div>

      {load.status === "loading" ? (
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded bg-elevated" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-elevated" />
          <div className="h-3 w-10/12 animate-pulse rounded bg-elevated" />
          <div className="h-3 w-9/12 animate-pulse rounded bg-elevated" />
          <p className="mt-1 text-xs text-muted-foreground">
            AI sedang menyiapkan penjelasan...
          </p>
        </div>
      ) : load.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {load.message}
        </p>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {load.explanation}
        </p>
      )}
    </Card>
  );
}
