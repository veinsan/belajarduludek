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

export type AdminTryoutQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
};

export function AdminTryoutRunner({
  title,
  questions,
}: {
  title: string;
  questions: AdminTryoutQuestion[];
}) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [finished, setFinished] = React.useState(false);

  const current = questions[index];
  const isLast = index === questions.length - 1;

  function choose(choiceIndex: number) {
    if (selected !== null) return;
    setSelected(choiceIndex);
    if (choiceIndex === current.correctIndex) setScore((value) => value + 1);
  }

  function next() {
    if (selected === null) return;
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tryout belum punya soal</CardTitle>
          <CardDescription>
            Hubungi admin untuk melengkapi soal tryout ini.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="mx-auto w-full max-w-xl border-border-strong">
        <CardHeader>
          <CardTitle>Tryout selesai</CardTitle>
          <CardDescription>{title}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-4">
          <p className="text-5xl font-semibold tracking-tight">
            {score} <span className="text-muted-foreground">/ {questions.length}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Nilai kamu: <span className="font-medium">{percentage}%</span>
          </p>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/tryout">Kembali ke tryout</Link>
          </Button>
          <Button
            onClick={() => {
              setIndex(0);
              setSelected(null);
              setScore(0);
              setFinished(false);
            }}
          >
            Ulangi
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const explanation =
    selected !== null && current.explanation ? current.explanation : null;

  return (
    <Card className="mx-auto w-full max-w-xl border-border-strong">
      <CardHeader>
        <CardDescription>
          Pertanyaan {index + 1} dari {questions.length}
        </CardDescription>
        <CardTitle className="text-xl leading-snug">
          {current.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          {current.choices.map((choice, choiceIndex) => {
            const answered = selected !== null;
            const isCorrect = choiceIndex === current.correctIndex;
            const isSelected = choiceIndex === selected;
            return (
              <li key={`${index}-${choiceIndex}`}>
                <button
                  type="button"
                  onClick={() => choose(choiceIndex)}
                  disabled={answered}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border bg-background px-4 py-3 text-left text-sm transition-all",
                    "hover:-translate-y-0.5 hover:bg-muted disabled:cursor-not-allowed disabled:hover:translate-y-0",
                    answered &&
                      isCorrect &&
                      "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    answered &&
                      isSelected &&
                      !isCorrect &&
                      "border-destructive bg-destructive/10 text-destructive",
                    !answered &&
                      "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  )}
                >
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-medium">
                    {String.fromCharCode(65 + choiceIndex)}
                  </span>
                  <span className="whitespace-pre-wrap">{choice}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {explanation ? (
          <p className="rounded-lg border bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
            {explanation}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-2">
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
