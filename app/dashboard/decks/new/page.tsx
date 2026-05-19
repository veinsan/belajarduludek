"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { Textarea } from "@/components/ui/textarea";

export default function NewDeckPage() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = (await res.json()) as {
        error?: string;
        deck?: { id: string };
      };
      if (!res.ok || !data.deck) {
        setError(data.error ?? "Gagal membuat deck.");
        return;
      }
      router.push(`/dashboard/decks/${data.deck.id}`);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Buat deck baru</CardTitle>
          <CardDescription>
            Beri judul yang jelas supaya mudah dicari nanti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="new-deck-form"
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
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
                placeholder="Contoh: Biologi Sel"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Materi apa yang ada di deck ini?"
              />
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
            <Link href="/dashboard">Batal</Link>
          </Button>
          <Button
            type="submit"
            form="new-deck-form"
            size="lg"
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
