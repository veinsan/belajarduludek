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
import {
  QUIZ_MIN_CARDS,
  generateQuizQuestions,
  type QuizQuestion,
} from "@/lib/quiz";

type DeckOption = {
  id: string;
  title: string;
  cards: { id: string; front: string; back: string }[];
};

type Phase =
  | { state: "picking" }
  | { state: "running"; questions: QuizQuestion[] };

export function TryoutRunner({ decks }: { decks: DeckOption[] }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [phase, setPhase] = React.useState<Phase>({ state: "picking" });

  function toggleDeck(deckId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(deckId)) next.delete(deckId);
      else next.add(deckId);
      return next;
    });
  }

  function start() {
    const cards = decks
      .filter((d) => selected.has(d.id))
      .flatMap((d) => d.cards);
    if (cards.length < QUIZ_MIN_CARDS) return;
    setPhase({ state: "running", questions: generateQuizQuestions(cards) });
  }

  function backToPicker() {
    setPhase({ state: "picking" });
  }

  if (phase.state === "picking") {
    const eligibleDecks = decks.filter((d) => d.cards.length > 0);
    const selectedCards = decks
      .filter((d) => selected.has(d.id))
      .reduce((sum, d) => sum + d.cards.length, 0);
    const canStart = selectedCards >= QUIZ_MIN_CARDS;

    return (
      <Card className="animate-enter-up mx-auto w-full max-w-xl border-border-strong shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
        <CardHeader>
          <CardTitle>Pilih deck untuk tryout</CardTitle>
          <CardDescription>
            Pilih beberapa deck untuk membuat tryout gabungan. Butuh minimal{" "}
            {QUIZ_MIN_CARDS} kartu dari deck yang dipilih.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eligibleDecks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Kamu belum punya deck dengan kartu. Buat deck dan tambahkan kartu
              dulu untuk mulai tryout.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {eligibleDecks.map((deck, index) => {
                const checked = selected.has(deck.id);
                return (
                  <li
                    key={deck.id}
                    className="animate-enter-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border bg-background px-4 py-3 text-sm transition-all hover:-translate-y-0.5 hover:bg-muted",
                        checked && "border-ring bg-muted/60"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDeck(deck.id)}
                        className="mt-1"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{deck.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {deck.cards.length} kartu
                        </span>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {selectedCards} kartu dipilih
          </p>
          <Button onClick={start} disabled={!canStart}>
            Mulai Tryout
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <RunningQuiz
      questions={phase.questions}
      onExit={backToPicker}
    />
  );
}

function RunningQuiz({
  questions,
  onExit,
}: {
  questions: QuizQuestion[];
  onExit: () => void;
}) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [finished, setFinished] = React.useState(false);

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

  if (finished) {
    const percentage = Math.round((score / total) * 100);
    return (
      <Card className="animate-enter-up mx-auto w-full max-w-xl border-border-strong shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
        <CardHeader>
          <CardTitle>Tryout selesai</CardTitle>
          <CardDescription>
            Skor kamu dari {total} pertanyaan.
          </CardDescription>
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
            <Link href="/dashboard">Kembali ke dashboard</Link>
          </Button>
          <Button onClick={onExit}>Pilih deck lagi</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card key={index} className="animate-enter-up mx-auto w-full max-w-xl border-border-strong shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      <CardHeader>
        <CardDescription>
          Pertanyaan {index + 1} dari {total}
        </CardDescription>
        <CardTitle className="text-xl leading-snug">{current.front}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {current.choices.map((choice, i) => {
            const answered = selected !== null;
            const isCorrect = i === current.correctIndex;
            const isSelected = i === selected;
            return (
              <li
                key={i}
                className="animate-enter-up"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <button
                  type="button"
                  onClick={() => choose(i)}
                  disabled={answered}
                  aria-pressed={isSelected}
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
