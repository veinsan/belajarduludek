"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FlashcardData = {
  id: string;
  front: string;
  back: string;
};

export function DeckCards({
  deckId,
  initialCards,
}: {
  deckId: string;
  initialCards: FlashcardData[];
}) {
  const router = useRouter();
  const [cards, setCards] = React.useState<FlashcardData[]>(initialCards);
  const [addOpen, setAddOpen] = React.useState(initialCards.length === 0);
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const frontRef = React.useRef<HTMLInputElement | null>(null);

  function openForm() {
    setAddOpen(true);
    setError(null);
    setTimeout(() => frontRef.current?.focus(), 0);
  }

  function closeForm() {
    setAddOpen(false);
    setError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front, back }),
      });
      const data = (await res.json()) as {
        error?: string;
        card?: FlashcardData;
      };
      if (!res.ok || !data.card) {
        setError(data.error ?? "Gagal menambah kartu.");
        return;
      }
      setCards((prev) => [...prev, data.card!]);
      setFront("");
      setBack("");
      frontRef.current?.focus();
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleUpdated(updated: FlashcardData) {
    setCards((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    router.refresh();
  }

  function handleDeleted(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        {addOpen ? (
          <Button variant="outline" size="lg" onClick={closeForm}>
            Tutup form
          </Button>
        ) : (
          <Button size="lg" onClick={openForm}>
            Tambah Kartu
          </Button>
        )}
      </div>

      {addOpen ? (
        <Card>
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 px-6"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-front">Pertanyaan (depan kartu)</Label>
              <Input
                id="card-front"
                ref={frontRef}
                type="text"
                required
                maxLength={500}
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Contoh: Apa fungsi mitokondria?"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-back">Jawaban (belakang kartu)</Label>
              <Textarea
                id="card-back"
                rows={3}
                required
                maxLength={2000}
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Contoh: Menghasilkan energi dalam bentuk ATP."
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan kartu"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {cards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada kartu</CardTitle>
            <CardDescription>
              Tambahkan flashcard pertamamu untuk mulai belajar. Klik kartu untuk
              membaliknya dan melihat jawaban.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <FlashcardItem
              key={card.id}
              card={card}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FlashcardItem({
  card,
  onUpdated,
  onDeleted,
}: {
  card: FlashcardData;
  onUpdated: (card: FlashcardData) => void;
  onDeleted: (id: string) => void;
}) {
  const [flipped, setFlipped] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editFront, setEditFront] = React.useState(card.front);
  const [editBack, setEditBack] = React.useState(card.back);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  function startEdit() {
    setEditFront(card.front);
    setEditBack(card.back);
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: editFront, back: editBack }),
      });
      const data = (await res.json()) as {
        error?: string;
        card?: FlashcardData;
      };
      if (!res.ok || !data.card) {
        setError(data.error ?? "Gagal menyimpan perubahan.");
        return;
      }
      onUpdated({
        id: data.card.id,
        front: data.card.front,
        back: data.card.back,
      });
      setEditing(false);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res
          .json()
          .catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Gagal menghapus kartu.");
        return;
      }
      onDeleted(card.id);
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <li>
        <Card>
          <form onSubmit={onSave} className="flex flex-col gap-3 px-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`edit-front-${card.id}`}>Pertanyaan</Label>
              <Input
                id={`edit-front-${card.id}`}
                type="text"
                required
                maxLength={500}
                value={editFront}
                onChange={(e) => setEditFront(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`edit-back-${card.id}`}>Jawaban</Label>
              <Textarea
                id={`edit-back-${card.id}`}
                rows={3}
                required
                maxLength={2000}
                value={editBack}
                onChange={(e) => setEditBack(e.target.value)}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={cancelEdit}
                disabled={saving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Card>
      </li>
    );
  }

  const faceClass =
    "absolute inset-0 flex items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm px-6 py-5 text-center [backface-visibility:hidden]";

  return (
    <li className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        aria-label={
          flipped ? "Tampilkan pertanyaan" : "Tampilkan jawaban"
        }
        className="group block h-44 w-full rounded-xl text-left [perspective:1000px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <div
          className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
        >
          <div className={faceClass}>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Pertanyaan
              </span>
              <p className="text-base font-medium leading-snug">
                {card.front}
              </p>
            </div>
          </div>
          <div
            className={`${faceClass} bg-muted/60 [transform:rotateY(180deg)]`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Jawaban
              </span>
              <p className="text-sm leading-snug whitespace-pre-wrap">
                {card.back}
              </p>
            </div>
          </div>
        </div>
      </button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={startEdit}
          disabled={deleting}
        >
          Ubah
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? "Menghapus..." : "Hapus"}
        </Button>
      </div>
    </li>
  );
}
