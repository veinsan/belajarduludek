"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, RefreshCw, X } from "lucide-react";

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
import { cn } from "@/lib/utils";

type FlashcardData = {
  id: string;
  front: string;
  back: string;
  imageUrl: string | null;
};

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function DeckCards({
  deckId,
  initialCards,
  canEdit = true,
}: {
  deckId: string;
  initialCards: FlashcardData[];
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [cards, setCards] = React.useState<FlashcardData[]>(initialCards);
  const [addOpen, setAddOpen] = React.useState(
    canEdit && initialCards.length === 0
  );
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const frontRef = React.useRef<HTMLInputElement | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  function openForm() {
    setAddOpen(true);
    setError(null);
    setTimeout(() => frontRef.current?.focus(), 0);
  }

  function closeForm() {
    setAddOpen(false);
    setError(null);
    clearImage();
  }

  function clearImage() {
    setImage(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function onPickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Gambar harus berformat JPEG, PNG, WebP, atau GIF.");
      clearImage();
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setError("Ukuran gambar maksimal 5 MB.");
      clearImage();
      return;
    }
    setError(null);
    setImage(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let res: Response;
      if (image) {
        const formData = new FormData();
        formData.set("front", front);
        formData.set("back", back);
        formData.set("image", image);
        res = await fetch(`/api/decks/${deckId}/cards`, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(`/api/decks/${deckId}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front, back }),
        });
      }
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
      clearImage();
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
      {canEdit ? (
        <div className="flex items-center justify-end">
          {addOpen ? (
            <Button variant="outline" size="lg" onClick={closeForm}>
              Tutup form
            </Button>
          ) : (
            <Button size="lg" onClick={openForm}>
              <Plus />
              Tambah Kartu
            </Button>
          )}
        </div>
      ) : null}

      {canEdit && addOpen ? (
        <Card className="liquid-card rounded-[1.25rem]">
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-image">Gambar (opsional)</Label>
              {imagePreview ? (
                <div className="relative w-fit overflow-hidden rounded-xl border border-border-strong bg-elevated/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Pratinjau gambar kartu"
                    className="max-h-44 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    aria-label="Hapus gambar"
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="card-image"
                  className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border-strong bg-elevated/40 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary-light/50 hover:text-foreground"
                >
                  <ImagePlus className="size-4" />
                  Tambahkan gambar ke kartu
                </label>
              )}
              <input
                id="card-image"
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={onPickImage}
              />
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, atau GIF, maksimal 5 MB. Tampil di sisi
                pertanyaan saat belajar dan kuis.
              </p>
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
        <Card className="liquid-card rounded-[1.25rem]">
          <CardHeader>
            <CardTitle>Belum ada kartu</CardTitle>
            <CardDescription>
              {canEdit
                ? "Tambahkan flashcard pertamamu untuk mulai belajar. Klik kartu untuk membaliknya dan melihat jawaban."
                : "Guru belum menambahkan kartu ke deck ini. Cek lagi nanti, ya."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <FlashcardItem
              key={card.id}
              card={card}
              canEdit={canEdit}
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
  canEdit,
  onUpdated,
  onDeleted,
}: {
  card: FlashcardData;
  canEdit: boolean;
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
        imageUrl: data.card.imageUrl ?? card.imageUrl,
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
        <Card className="liquid-card rounded-[1.25rem]">
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
    "absolute inset-0 flex flex-col overflow-hidden rounded-[1.25rem] border px-5 py-4 text-center [backface-visibility:hidden]";

  return (
    <li className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        aria-label={
          flipped ? "Tampilkan pertanyaan" : "Tampilkan jawaban"
        }
        className={cn(
          "group block w-full rounded-[1.25rem] text-left outline-none transition-transform duration-150 ease-out [perspective:1200px] focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.98]",
          card.imageUrl ? "h-64" : "h-44"
        )}
      >
        <div
          className="relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
          style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
        >
          <div
            className={cn(
              faceClass,
              "border-white/12 bg-card text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_14px_40px_rgba(0,0,0,0.25)] transition-colors duration-200 group-hover:border-primary-light/35"
            )}
          >
            <span className="mx-auto flex w-fit shrink-0 items-center rounded-full border border-primary-light/25 bg-primary/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-light">
              Pertanyaan
            </span>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 py-2">
              {card.imageUrl ? (
                <div className="min-h-0 flex-1 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.imageUrl}
                    alt=""
                    className="h-full w-auto object-contain"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <p className="line-clamp-3 text-base font-bold leading-snug md:text-lg">
                {card.front}
              </p>
            </div>
            <span className="flex shrink-0 items-center justify-center gap-1.5 text-[10px] text-muted-foreground transition-colors duration-200 group-hover:text-primary-light">
              <RefreshCw className="size-3" aria-hidden />
              klik untuk lihat jawaban
            </span>
          </div>
          <div
            className={cn(
              faceClass,
              "border-primary-light/35 bg-card text-card-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_40px_rgba(0,0,0,0.3)] [transform:rotateY(180deg)]"
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/35 via-primary/15 to-primary/25"
            />
            <span className="relative mx-auto flex w-fit shrink-0 items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_6px_18px_rgba(95,43,206,0.35)]">
              Jawaban
            </span>
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden py-2">
              <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed md:text-base">
                {card.back}
              </p>
            </div>
            <span className="relative flex shrink-0 items-center justify-center gap-1.5 text-[10px] text-primary-light">
              <RefreshCw className="size-3" aria-hidden />
              klik untuk balik ke pertanyaan
            </span>
          </div>
        </div>
      </button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {canEdit ? (
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
      ) : null}
    </li>
  );
}
