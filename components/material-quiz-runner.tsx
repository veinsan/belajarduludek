"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizQuestionCard, QuizResultCard } from "@/components/quiz-ui";

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
      <Card className="liquid-card mx-auto w-full max-w-xl gap-5 overflow-hidden rounded-[1.35rem] pt-0">
        <div className="h-1.5 w-full overflow-hidden bg-elevated">
          <div className="animate-progress h-full rounded-r-full bg-gradient-to-r from-primary to-accent" />
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-light">
            <Sparkles className="size-3.5 animate-pulse" />
            AI sedang membuat soal dari materimu
          </p>
          {/* Skeleton mengikuti bentuk kartu pertanyaan */}
          <div className="h-7 w-4/5 animate-pulse rounded-lg bg-elevated" />
          <div className="flex flex-col gap-2.5 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded-xl bg-elevated"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (load.status === "error") {
    return (
      <Card className="liquid-card mx-auto w-full max-w-xl rounded-[1.35rem]">
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
    return (
      <QuizResultCard
        title={materialTitle}
        score={score}
        total={total}
        onRestart={restart}
        backAction={
          <Button asChild variant="outline" size="lg">
            <Link href={`/dashboard/materials/${materialId}`}>
              Kembali ke materi
            </Link>
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
      question={current.question}
      choices={current.choices}
      correctIndex={current.correctIndex}
      selected={selected}
      score={score}
      onChoose={choose}
      onNext={next}
    />
  );
}
