"use client";

import * as React from "react";
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
import { cn } from "@/lib/utils";

type MaterialQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; questions: MaterialQuestion[] };

export function MaterialQuizRunner({
  materialId,
  materialTitle,
}: {
  materialId: string;
  materialTitle: string;
}) {
  const [load, setLoad] = React.useState<LoadState>({ status: "loading" });
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [finished, setFinished] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/materials/${materialId}/generate-quiz`, { method: "POST" })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          questions?: MaterialQuestion[];
        };
        if (cancelled) return;
        if (!res.ok || !data.questions || data.questions.length === 0) {
          setLoad({
            status: "error",
            message: data.error ?? "Gagal memuat pertanyaan.",
          });
          return;
        }
        setLoad({ status: "ready", questions: data.questions });
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
  }, [materialId]);

  if (load.status === "loading") {
    return (
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <CardTitle>Menyiapkan kuis...</CardTitle>
          <CardDescription>
            AI sedang membuat pertanyaan dari materimu.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (load.status === "error") {
    return (
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <CardTitle>Gagal memuat kuis</CardTitle>
          <CardDescription>{load.message}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
          <Button asChild variant="outline">
            <Link href={`/dashboard/materials/${materialId}`}>
              Kembali ke materi
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const questions = load.questions;
  const total = questions.length;
  const current = questions[index];
  const isLast = index === total - 1;

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    if (selected === null) return;
    if (isLast) {
      setFinished(true);
    } else {
      setIndex((n) => n + 1);
      setSelected(null);
    }
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const percentage = Math.round((score / total) * 100);
    return (
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <CardTitle>Kuis selesai</CardTitle>
          <CardDescription>{materialTitle}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-4">
          <p className="text-5xl font-semibold tracking-tight">
            {score} <span className="text-muted-foreground">/ {total}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Nilai kamu: <span className="font-medium">{percentage}%</span>
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/materials/${materialId}`}>
              Kembali ke materi
            </Link>
          </Button>
          <Button onClick={restart}>Ulangi kuis</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardDescription>
          Pertanyaan {index + 1} dari {total}
        </CardDescription>
        <CardTitle className="text-xl leading-snug">
          {current.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {current.choices.map((choice, i) => {
            const answered = selected !== null;
            const isCorrect = i === current.correctIndex;
            const isSelected = i === selected;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  disabled={answered}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border bg-background px-4 py-3 text-left text-sm transition-colors",
                    "hover:bg-muted disabled:cursor-not-allowed",
                    answered &&
                      isCorrect &&
                      "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    answered &&
                      isSelected &&
                      !isCorrect &&
                      "border-destructive bg-destructive/10 text-destructive",
                    !answered &&
                      "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 outline-none"
                  )}
                >
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-medium">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="whitespace-pre-wrap">{choice}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Skor sementara: {score} / {index + (selected !== null ? 1 : 0)}
        </p>
        <Button onClick={next} disabled={selected === null}>
          {isLast ? "Lihat hasil" : "Berikutnya"}
        </Button>
      </CardFooter>
    </Card>
  );
}
