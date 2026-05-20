"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function MaterialActions({ materialId }: { materialId: string }) {
  const router = useRouter();
  const [summarizing, setSummarizing] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSummarize() {
    setError(null);
    setSummarizing(true);
    try {
      const res = await fetch(`/api/materials/${materialId}/summarize`, {
        method: "POST",
      });
      const data = (await res
        .json()
        .catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Gagal membuat ringkasan.");
        return;
      }
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSummarizing(false);
    }
  }

  async function onGenerateDeck() {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/materials/${materialId}/generate-deck`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        deckId?: string;
      };
      if (!res.ok || !data.deckId) {
        setError(data.error ?? "Gagal membuat deck.");
        return;
      }
      router.push(`/dashboard/decks/${data.deckId}`);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setGenerating(false);
    }
  }

  const busy = summarizing || generating;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSummarize}
          disabled={busy}
        >
          {summarizing ? "Memproses..." : "Buat Ringkasan"}
        </Button>
        <Button type="button" onClick={onGenerateDeck} disabled={busy}>
          {generating ? "Memproses..." : "Generate Deck"}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
