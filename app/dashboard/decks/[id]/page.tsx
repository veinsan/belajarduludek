import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, Layers, Play, Trophy } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { deckAccessWhere } from "@/lib/access";
import { QUIZ_MIN_CARDS } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import { DeckCards } from "@/components/deck-cards";

type PageProps = { params: Promise<{ id: string }> };

export default async function DeckDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const [deck, bestQuiz] = await Promise.all([
    prisma.deck.findFirst({
      where: { id, ...deckAccessWhere(session.sub) },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        user: { select: { name: true, role: true } },
        cards: {
          orderBy: { createdAt: "asc" },
          select: { id: true, front: true, back: true, imageUrl: true },
        },
      },
    }),
    prisma.quiz.findFirst({
      where: { deckId: id, userId: session.sub },
      orderBy: { createdAt: "desc" },
      select: { score: true, total: true },
    }),
  ]);

  if (!deck) notFound();

  const isOwner = deck.userId === session.sub;
  const canStartQuiz = deck.cards.length >= QUIZ_MIN_CARDS;
  const cardsNeeded = QUIZ_MIN_CARDS - deck.cards.length;
  const lastScore = bestQuiz
    ? Math.round((bestQuiz.score / bestQuiz.total) * 100)
    : null;

  return (
    <div className="flex flex-col gap-8">
      <section className="liquid-glass neon-edge animate-enter-up flex flex-col gap-5 rounded-[1.4rem] px-6 py-7 md:px-8">
        <Link
          href="/dashboard/decks"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Semua deck
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">
                Deck
              </p>
              {!isOwner ? (
                <span className="flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                  <GraduationCap className="size-3" />
                  Dari {deck.user.role === "GURU" ? "Guru" : "Admin"}{" "}
                  {deck.user.name}
                </span>
              ) : null}
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              {deck.title}
            </h1>
            {deck.description ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {deck.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-1">
            {canStartQuiz ? (
              <Button asChild size="lg" className="shadow-[0_12px_34px_rgba(95,43,206,0.28)]">
                <Link href={`/dashboard/decks/${deck.id}/quiz`}>
                  <Play />
                  Mulai Kuis
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" disabled>
                  <Play />
                  Mulai Kuis
                </Button>
                <p className="text-xs text-muted-foreground">
                  {isOwner
                    ? `Tambah ${cardsNeeded} kartu lagi untuk mulai kuis.`
                    : `Deck ini butuh ${cardsNeeded} kartu lagi sebelum bisa dikuiskan.`}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:max-w-lg sm:grid-cols-3">
          <div className="rounded-xl border border-white/12 bg-white/[0.05] p-4">
            <Layers className="mb-2 size-4 text-primary-light" />
            <p className="text-2xl font-black tracking-tight">
              {deck.cards.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total kartu
            </p>
          </div>
          <div className="rounded-xl border border-white/12 bg-white/[0.05] p-4">
            <Play className="mb-2 size-4 text-primary-light" />
            <p className="text-sm font-bold leading-7">
              {canStartQuiz ? "Siap dimulai" : `Butuh ${cardsNeeded} lagi`}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Status kuis
            </p>
          </div>
          <div className="col-span-2 rounded-xl border border-white/12 bg-white/[0.05] p-4 sm:col-span-1">
            <Trophy className="mb-2 size-4 text-amber-200" />
            <p className="text-2xl font-black tracking-tight">
              {lastScore !== null ? `${lastScore}%` : "—"}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Skor terakhirmu
            </p>
          </div>
        </div>
      </section>

      <DeckCards
        deckId={deck.id}
        initialCards={deck.cards}
        canEdit={isOwner}
      />
    </div>
  );
}
