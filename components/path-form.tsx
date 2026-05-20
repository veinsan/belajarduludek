"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DeckOption = {
  id: string;
  title: string;
};

export function PathForm({ decks }: { decks: DeckOption[] }) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [orderedIds, setOrderedIds] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const deckById = React.useMemo(() => {
    const map = new Map<string, DeckOption>();
    for (const d of decks) map.set(d.id, d);
    return map;
  }, [decks]);

  const available = decks.filter((d) => !orderedIds.includes(d.id));
  const ordered = orderedIds
    .map((id) => deckById.get(id))
    .filter((d): d is DeckOption => d !== undefined);

  function addDeck(id: string) {
    setOrderedIds((prev) => [...prev, id]);
  }

  function removeDeck(id: string) {
    setOrderedIds((prev) => prev.filter((x) => x !== id));
  }

  function move(id: string, direction: -1 | 1) {
    setOrderedIds((prev) => {
      const idx = prev.indexOf(id);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (orderedIds.length === 0) {
      setError("Pilih minimal satu deck.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, deckIds: orderedIds }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        path?: { id: string };
      };
      if (!res.ok || !data.path) {
        setError(data.error ?? "Gagal menyimpan jalur belajar.");
        return;
      }
      router.push("/dashboard/paths");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Buat jalur belajar baru</CardTitle>
        <CardDescription>
          Beri judul, lalu pilih dan urutkan deck yang ingin dipelajari.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="new-path-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Persiapan UTBK Biologi"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Urutan deck</p>
            {ordered.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Belum ada deck dipilih. Tambahkan dari daftar di bawah.
              </p>
            ) : (
              <ol className="flex flex-col gap-2">
                {ordered.map((deck, idx) => (
                  <li
                    key={deck.id}
                    className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm"
                  >
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-semibold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 truncate font-medium">
                      {deck.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => move(deck.id, -1)}
                        disabled={idx === 0}
                        aria-label="Naikkan urutan"
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => move(deck.id, 1)}
                        disabled={idx === ordered.length - 1}
                        aria-label="Turunkan urutan"
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeDeck(deck.id)}
                        aria-label="Hapus dari jalur"
                      >
                        ×
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Deck tersedia</p>
            {decks.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Kamu belum punya deck. Buat deck dulu untuk membuat jalur.
              </p>
            ) : available.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Semua deck sudah ditambahkan ke jalur ini.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {available.map((deck) => (
                  <li
                    key={deck.id}
                    className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm"
                  >
                    <span className="flex-1 truncate">{deck.title}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addDeck(deck.id)}
                    >
                      Tambah
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href="/dashboard/paths">Batal</Link>
        </Button>
        <Button
          type="submit"
          form="new-path-form"
          size="lg"
          disabled={submitting}
        >
          {submitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
