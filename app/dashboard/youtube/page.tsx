"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VideoResult = {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
};

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; videos: VideoResult[]; query: string }
  | { status: "error"; message: string };

export default function YouTubePage() {
  const [query, setQuery] = React.useState("");
  const [state, setState] = React.useState<FetchState>({ status: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/youtube?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as {
        error?: string;
        videos?: VideoResult[];
      };
      if (!res.ok || !data.videos) {
        setState({
          status: "error",
          message: data.error ?? "Pencarian gagal.",
        });
        return;
      }
      setState({ status: "success", videos: data.videos, query: q });
    } catch {
      setState({
        status: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Cari video belajar
        </h1>
        <p className="text-sm text-muted-foreground">
          Cari video edukasi di YouTube dan tonton langsung dari sini.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="yt-q">Kata kunci</Label>
          <Input
            id="yt-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: matematika SMA limit fungsi"
            maxLength={200}
            required
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={state.status === "loading" || !query.trim()}
        >
          {state.status === "loading" ? "Mencari..." : "Cari"}
        </Button>
      </form>

      {state.status === "error" ? (
        <Card>
          <CardHeader>
            <CardTitle>Pencarian gagal</CardTitle>
            <CardDescription className="text-destructive">
              {state.message}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {state.status === "success" ? (
        state.videos.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Tidak ada hasil</CardTitle>
              <CardDescription>
                Coba kata kunci lain untuk &quot;{state.query}&quot;.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.videos.map((video) => (
              <li key={video.id}>
                <Card className="overflow-hidden gap-0 py-0">
                  <div className="aspect-video w-full bg-muted">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                      title={video.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                  <div className="flex flex-col gap-1 px-4 py-3">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">
                      {video.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {video.channelTitle}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
