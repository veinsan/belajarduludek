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

export default function NewMaterialPage() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = (await res.json()) as {
        error?: string;
        material?: { id: string };
      };
      if (!res.ok || !data.material) {
        setError(data.error ?? "Gagal menyimpan materi.");
        return;
      }
      router.push("/dashboard/materials");
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
          <CardTitle>Buat materi baru</CardTitle>
          <CardDescription>
            Tulis judul dan isi materi yang ingin kamu simpan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="new-material-form"
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
                placeholder="Contoh: Rangkuman Fotosintesis"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="content">Isi materi</Label>
              <Textarea
                id="content"
                rows={10}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis isi materi di sini..."
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
            form="new-material-form"
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
