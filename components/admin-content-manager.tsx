"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileText,
  MonitorPlay,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

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
import { cn } from "@/lib/utils";

type ContentType = "classes" | "tryouts" | "books";

type AdminClassItem = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  content: string | null;
  videoId: string | null;
  thumbnailUrl: string | null;
  updatedAt: string;
};

type AdminTryoutItem = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  questions: unknown;
  updatedAt: string;
};

type AdminBookItem = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  content: string;
  coverUrl: string | null;
  pdfUrl: string | null;
  pdfFileName: string | null;
  updatedAt: string;
};

type FormState = {
  title: string;
  subject: string;
  description: string;
  content: string;
  videoId: string;
  thumbnailUrl: string;
  durationMinutes: string;
  questions: string;
  author: string;
  coverUrl: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  subject: "",
  description: "",
  content: "",
  videoId: "",
  thumbnailUrl: "",
  durationMinutes: "",
  questions: JSON.stringify(
    [
      {
        question: "Contoh soal",
        choices: ["Jawaban benar", "Distraktor A", "Distraktor B", "Distraktor C"],
        correctIndex: 0,
        explanation: "Penjelasan singkat jawaban.",
      },
    ],
    null,
    2
  ),
  author: "",
  coverUrl: "",
};

const TABS: {
  type: ContentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: "classes", label: "Kelas", icon: MonitorPlay },
  { type: "tryouts", label: "Tryout", icon: ClipboardList },
  { type: "books", label: "Buku", icon: BookOpen },
];

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function getJsonText(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return EMPTY_FORM.questions;
  }
}

function getItemTitle(
  type: ContentType,
  item: AdminClassItem | AdminTryoutItem | AdminBookItem
) {
  if (type === "classes") {
    return `${(item as AdminClassItem).subject} · ${item.title}`;
  }
  if (type === "books") {
    const author = (item as AdminBookItem).author;
    return author ? `${item.title} · ${author}` : item.title;
  }
  return item.title;
}

export function AdminContentManager({
  classes,
  tryouts,
  books,
}: {
  classes: AdminClassItem[];
  tryouts: AdminTryoutItem[];
  books: AdminBookItem[];
}) {
  const router = useRouter();
  const [type, setType] = React.useState<ContentType>("classes");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const items =
    type === "classes" ? classes : type === "tryouts" ? tryouts : books;
  const editing = items.find((item) => item.id === editingId) ?? null;

  function reset(nextType = type) {
    setType(nextType);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPdfFile(null);
    setError(null);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function edit(item: AdminClassItem | AdminTryoutItem | AdminBookItem) {
    setEditingId(item.id);
    setError(null);

    if (type === "classes") {
      const kelas = item as AdminClassItem;
      setForm({
        ...EMPTY_FORM,
        title: kelas.title,
        subject: kelas.subject,
        description: kelas.description ?? "",
        content: kelas.content ?? "",
        videoId: kelas.videoId ?? "",
        thumbnailUrl: kelas.thumbnailUrl ?? "",
      });
      return;
    }

    if (type === "tryouts") {
      const tryout = item as AdminTryoutItem;
      setForm({
        ...EMPTY_FORM,
        title: tryout.title,
        description: tryout.description ?? "",
        durationMinutes: tryout.durationMinutes?.toString() ?? "",
        questions: getJsonText(tryout.questions),
      });
      return;
    }

    const book = item as AdminBookItem;
    setForm({
      ...EMPTY_FORM,
      title: book.title,
      author: book.author ?? "",
      description: book.description ?? "",
      content: book.content,
      coverUrl: book.coverUrl ?? "",
    });
    setPdfFile(null);
  }

  function payload() {
    if (type === "classes") {
      return {
        title: form.title,
        subject: form.subject,
        description: form.description,
        content: form.content,
        videoId: form.videoId,
        thumbnailUrl: form.thumbnailUrl,
      };
    }

    if (type === "tryouts") {
      let questions: unknown;
      try {
        questions = JSON.parse(form.questions);
      } catch {
        throw new Error("JSON soal tryout belum valid.");
      }
      return {
        title: form.title,
        description: form.description,
        durationMinutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : null,
        questions,
      };
    }

    return {
      title: form.title,
      author: form.author,
      description: form.description,
      content: form.content,
      coverUrl: form.coverUrl,
    };
  }

  function bookPayload() {
    const formData = new FormData();
    formData.set("title", form.title);
    formData.set("author", form.author);
    formData.set("description", form.description);
    formData.set("content", form.content);
    formData.set("coverUrl", form.coverUrl);
    if (pdfFile) formData.set("pdf", pdfFile);
    return formData;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const res = await fetch(
        editingId
          ? `/api/admin/content/${type}/${editingId}`
          : `/api/admin/content/${type}`,
        type === "books"
          ? {
              method: editingId ? "PATCH" : "POST",
              body: bookPayload(),
            }
          : {
              method: editingId ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload()),
            }
      );
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) {
        setError(data?.error ?? "Gagal menyimpan konten.");
        return;
      }
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan konten.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/content/${type}/${id}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) {
        setError(data?.error ?? "Gagal menghapus konten.");
        return;
      }
      if (editingId === id) reset();
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Konten pembelajaran</CardTitle>
          <CardDescription>
            Konten yang dibuat admin akan tampil untuk semua pengguna.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const active = tab.type === type;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => reset(tab.type)}
                  className={cn(
                    "inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border-strong p-5 text-sm text-muted-foreground">
              Belum ada konten {TABS.find((tab) => tab.type === type)?.label.toLowerCase()}.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3",
                    editingId === item.id && "border-primary bg-primary/5"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {getItemTitle(type, item)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Diperbarui {formatDate(item.updatedAt)}
                    </p>
                    {type === "books" && (item as AdminBookItem).pdfUrl ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <FileText className="size-3" />
                        PDF terlampir
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => edit(item)}
                    >
                      <Pencil />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="xl:sticky xl:top-6 xl:self-start">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            {editing ? "Edit konten" : "Tambah konten"}
          </CardTitle>
          <CardDescription>
            {TABS.find((tab) => tab.type === type)?.label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="admin-content-form" onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Judul" id="admin-title">
              <Input
                id="admin-title"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                maxLength={140}
                required
              />
            </Field>

            {type === "classes" ? (
              <>
                <Field label="Mata pelajaran" id="admin-subject">
                  <Input
                    id="admin-subject"
                    value={form.subject}
                    onChange={(event) => update("subject", event.target.value)}
                    placeholder="Fisika, Biologi, Matematika..."
                    required
                  />
                </Field>
                <Field label="YouTube URL atau video ID" id="admin-video">
                  <Input
                    id="admin-video"
                    value={form.videoId}
                    onChange={(event) => update("videoId", event.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </Field>
                <Field label="Thumbnail URL" id="admin-thumbnail">
                  <Input
                    id="admin-thumbnail"
                    value={form.thumbnailUrl}
                    onChange={(event) =>
                      update("thumbnailUrl", event.target.value)
                    }
                    placeholder="Opsional"
                  />
                </Field>
                <Field label="Deskripsi" id="admin-description">
                  <Textarea
                    id="admin-description"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                  />
                </Field>
                <Field label="Catatan kelas" id="admin-content">
                  <Textarea
                    id="admin-content"
                    rows={5}
                    value={form.content}
                    onChange={(event) => update("content", event.target.value)}
                  />
                </Field>
              </>
            ) : null}

            {type === "tryouts" ? (
              <>
                <Field label="Deskripsi" id="admin-tryout-description">
                  <Textarea
                    id="admin-tryout-description"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                  />
                </Field>
                <Field label="Durasi menit" id="admin-duration">
                  <Input
                    id="admin-duration"
                    type="number"
                    min={1}
                    value={form.durationMinutes}
                    onChange={(event) =>
                      update("durationMinutes", event.target.value)
                    }
                    placeholder="Opsional"
                  />
                </Field>
                <Field label="Soal JSON" id="admin-questions">
                  <Textarea
                    id="admin-questions"
                    rows={12}
                    value={form.questions}
                    onChange={(event) =>
                      update("questions", event.target.value)
                    }
                    className="font-mono text-xs"
                    required
                  />
                </Field>
              </>
            ) : null}

            {type === "books" ? (
              <>
                <Field label="Penulis" id="admin-author">
                  <Input
                    id="admin-author"
                    value={form.author}
                    onChange={(event) => update("author", event.target.value)}
                    placeholder="Opsional"
                  />
                </Field>
                <Field label="Cover URL" id="admin-cover">
                  <Input
                    id="admin-cover"
                    value={form.coverUrl}
                    onChange={(event) => update("coverUrl", event.target.value)}
                    placeholder="Opsional"
                  />
                </Field>
                <Field label="Deskripsi" id="admin-book-description">
                  <Textarea
                    id="admin-book-description"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                  />
                </Field>
                <Field label="Isi buku" id="admin-book-content">
                  <Textarea
                    id="admin-book-content"
                    rows={10}
                    value={form.content}
                    onChange={(event) => update("content", event.target.value)}
                    placeholder="Opsional jika mengupload PDF"
                  />
                </Field>
                <Field label="Upload PDF" id="admin-book-pdf">
                  <Input
                    id="admin-book-pdf"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) =>
                      setPdfFile(event.target.files?.[0] ?? null)
                    }
                  />
                  {editing && (editing as AdminBookItem).pdfUrl ? (
                    <p className="text-xs text-muted-foreground">
                      PDF saat ini:{" "}
                      <a
                        href={(editing as AdminBookItem).pdfUrl ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {(editing as AdminBookItem).pdfFileName ?? "Buka PDF"}
                      </a>
                    </p>
                  ) : null}
                  {pdfFile ? (
                    <p className="text-xs text-muted-foreground">
                      File baru: {pdfFile.name}
                    </p>
                  ) : null}
                </Field>
              </>
            ) : null}
          </form>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          {editing ? (
            <Button type="button" variant="ghost" disabled={busy} onClick={() => reset()}>
              Batal
            </Button>
          ) : null}
          <Button type="submit" form="admin-content-form" disabled={busy}>
            {busy ? "Menyimpan..." : editing ? "Simpan edit" : "Tambah"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
