"use client";

import * as React from "react";
import { Check, PartyPopper, RotateCcw, Target, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Tampilan bersama untuk semua kuis (deck & materi): kartu pertanyaan dengan
 * progress bar + feedback warna instan, dan layar hasil bergaya perayaan.
 */

function useCountUp(target: number, durationMs = 1100) {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

export function QuizQuestionCard({
  index,
  total,
  question,
  imageUrl,
  choices,
  correctIndex,
  selected,
  score,
  onChoose,
  onNext,
}: {
  index: number;
  total: number;
  question: string;
  imageUrl?: string | null;
  choices: string[];
  correctIndex: number;
  selected: number | null;
  score: number;
  onChoose: (i: number) => void;
  onNext: () => void;
}) {
  const isLast = index === total - 1;
  const answered = selected !== null;
  const progress = ((index + (answered ? 1 : 0)) / total) * 100;

  return (
    <Card className="liquid-card animate-enter-up mx-auto w-full max-w-xl gap-5 overflow-hidden rounded-[1.35rem] pt-0">
      <div className="h-1.5 w-full bg-elevated">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>

      <div className="flex flex-col gap-3 px-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-light">
            Pertanyaan {index + 1} / {total}
          </p>
          <p
            key={score}
            className="animate-in fade-in zoom-in-75 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground duration-300 motion-reduce:animate-none"
          >
            Skor {score}
          </p>
        </div>
        <h2 className="text-xl font-extrabold leading-snug tracking-tight md:text-2xl">
          {question}
        </h2>
        {imageUrl ? (
          <div className="overflow-hidden rounded-xl border border-border-strong bg-elevated/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Gambar soal"
              className="mx-auto max-h-56 w-auto object-contain"
            />
          </div>
        ) : null}
      </div>

      <CardContent>
        <ul className="flex flex-col gap-2.5">
          {choices.map((choice, i) => {
            const isCorrect = i === correctIndex;
            const isSelected = i === selected;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onChoose(i)}
                  disabled={answered}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 ease-out",
                    !answered &&
                      "border-border-strong bg-background/60 hover:-translate-y-0.5 hover:border-primary-light/50 hover:bg-primary/10 active:translate-y-0 active:scale-[0.99] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 outline-none",
                    answered && "cursor-not-allowed",
                    answered &&
                      isCorrect &&
                      "animate-in zoom-in-[0.98] border-emerald-400/70 bg-emerald-500/15 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.12)] duration-300 motion-reduce:animate-none",
                    answered &&
                      isSelected &&
                      !isCorrect &&
                      "border-destructive/70 bg-destructive/15 text-destructive shadow-[0_0_24px_rgba(239,68,68,0.12)]",
                    answered && !isSelected && !isCorrect && "opacity-45"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors",
                      answered && isCorrect
                        ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-200"
                        : answered && isSelected
                          ? "border-destructive/70 bg-destructive/20 text-destructive"
                          : "border-border-strong bg-background text-muted-foreground"
                    )}
                  >
                    {answered && isCorrect ? (
                      <Check className="animate-in zoom-in-50 size-3.5 duration-200 motion-reduce:animate-none" />
                    ) : answered && isSelected ? (
                      <X className="animate-in zoom-in-50 size-3.5 duration-200 motion-reduce:animate-none" />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  <span className="whitespace-pre-wrap leading-relaxed">
                    {choice}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <p
          key={answered ? "answered" : "waiting"}
          className={cn(
            "animate-in fade-in slide-in-from-bottom-1 text-xs font-medium duration-300 motion-reduce:animate-none",
            answered
              ? selected === correctIndex
                ? "text-emerald-300"
                : "text-destructive"
              : "text-muted-foreground"
          )}
          aria-live="polite"
        >
          {answered
            ? selected === correctIndex
              ? "Benar! Mantap."
              : "Belum tepat, jawaban benar disorot hijau."
            : "Pilih salah satu jawaban."}
        </p>
        <Button onClick={onNext} disabled={!answered} size="lg">
          {isLast ? "Lihat hasil" : "Berikutnya"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function resultTier(percentage: number) {
  if (percentage >= 90)
    return { headline: "Luar biasa!", message: "Kamu menguasai materi ini. Pertahankan!" };
  if (percentage >= 70)
    return { headline: "Keren!", message: "Hampir sempurna, tinggal sedikit lagi." };
  if (percentage >= 50)
    return { headline: "Lumayan!", message: "Coba pelajari lagi kartunya, lalu ulangi kuisnya." };
  return { headline: "Jangan menyerah!", message: "Baca materinya sekali lagi, kamu pasti bisa." };
}

export function QuizResultCard({
  title,
  score,
  total,
  status,
  onRestart,
  backAction,
}: {
  title: string;
  score: number;
  total: number;
  status?: React.ReactNode;
  onRestart: () => void;
  backAction: React.ReactNode;
}) {
  const percentage = Math.round((score / total) * 100);
  const tier = resultTier(percentage);
  const good = percentage >= 70;
  const animatedPercentage = useCountUp(percentage);

  return (
    <Card className="liquid-card animate-enter-up mx-auto w-full max-w-xl gap-6 overflow-hidden rounded-[1.35rem] text-center">
      <div className="flex flex-col items-center gap-1 px-6">
        <span
          className={cn(
            "animate-in fade-in zoom-in-75 flex size-12 items-center justify-center rounded-2xl border duration-500 motion-reduce:animate-none",
            good
              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_32px_rgba(34,197,94,0.2)]"
              : "border-primary-light/30 bg-primary/20 text-primary-light"
          )}
        >
          {good ? <PartyPopper className="size-6" /> : <Target className="size-6" />}
        </span>
        <h2 className="animate-enter-up animation-delay-100 mt-2 text-3xl font-black tracking-tight">
          {tier.headline}
        </h2>
        <p className="animate-enter-up animation-delay-200 text-sm text-muted-foreground">
          {tier.message}
        </p>
      </div>

      <CardContent className="flex flex-col items-center gap-5">
        <div
          className={cn(
            "animate-enter-up animation-delay-200 flex size-36 items-center justify-center rounded-full p-2",
            good && "shadow-[0_0_48px_rgba(34,197,94,0.18)]"
          )}
          style={{
            background: `conic-gradient(${good ? "var(--chart-5)" : "var(--primary)"} ${animatedPercentage * 3.6}deg, var(--elevated) 0deg)`,
          }}
          role="img"
          aria-label={`Nilai ${percentage} persen`}
        >
          <div className="flex size-full flex-col items-center justify-center gap-0.5 rounded-full bg-card">
            <p className="text-4xl font-black tracking-tight tabular-nums">
              {animatedPercentage}%
            </p>
            <p className="max-w-[6.5rem] truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
          </div>
        </div>

        <div className="animate-enter-up animation-delay-300 grid w-full max-w-xs grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
            <p className="text-2xl font-black text-emerald-300">{score}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Benar
            </p>
          </div>
          <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3">
            <p className="text-2xl font-black text-destructive">{total - score}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Salah
            </p>
          </div>
        </div>

        {status ? (
          <p className="text-sm" aria-live="polite">
            {status}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="animate-enter-up animation-delay-400 flex items-center justify-center gap-2">
        {backAction}
        <Button onClick={onRestart} size="lg">
          <RotateCcw />
          Ulangi kuis
        </Button>
      </CardFooter>
    </Card>
  );
}
