"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { QuizQuestionCard, QuizResultCard } from "@/components/quiz-ui";
import type { QuizQuestion } from "@/lib/quiz";

type QuizRunnerProps = {
  deckId: string;
  deckTitle: string;
  questions: QuizQuestion[];
};

type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved" }
  | { status: "error"; message: string };

export function QuizRunner({ deckId, deckTitle, questions }: QuizRunnerProps) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const [save, setSave] = React.useState<SaveState>({ status: "idle" });
  const savedRef = React.useRef(false);

  const total = questions.length;
  const current = questions[index];
  const isLast = index === total - 1;

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.correctIndex) {
      setScore((s) => s + 1);
    }
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
    setSave({ status: "idle" });
    savedRef.current = false;
  }

  React.useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    setSave({ status: "saving" });
    fetch(`/api/decks/${deckId}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, total }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setSave({
            status: "error",
            message: data.error ?? "Gagal menyimpan skor.",
          });
          return;
        }
        setSave({ status: "saved" });
      })
      .catch(() => {
        setSave({
          status: "error",
          message: "Tidak dapat terhubung ke server.",
        });
      });
  }, [finished, score, total, deckId]);

  if (finished) {
    return (
      <QuizResultCard
        title={deckTitle}
        score={score}
        total={total}
        status={
          save.status === "saving" ? (
            <span className="text-muted-foreground">Menyimpan skor...</span>
          ) : save.status === "saved" ? (
            <span className="text-emerald-300">Skor tersimpan di statistikmu.</span>
          ) : save.status === "error" ? (
            <span className="text-destructive">{save.message}</span>
          ) : null
        }
        onRestart={restart}
        backAction={
          <Button asChild variant="outline" size="lg">
            <Link href={`/dashboard/decks/${deckId}`}>Kembali ke deck</Link>
          </Button>
        }
      />
    );
  }

  return (
    <QuizQuestionCard
      key={index}
      index={index}
      total={total}
      question={current.front}
      imageUrl={current.imageUrl}
      choices={current.choices}
      correctIndex={current.correctIndex}
      selected={selected}
      score={score}
      onChoose={choose}
      onNext={next}
    />
  );
}
