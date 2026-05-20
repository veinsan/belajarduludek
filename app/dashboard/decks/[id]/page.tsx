import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { QUIZ_MIN_CARDS } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import { DeckCards } from "@/components/deck-cards";

type PageProps = { params: Promise<{ id: string }> };

export default async function DeckDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const deck = await prisma.deck.findFirst({
    where: { id, userId: session.sub },
    select: {
      id: true,
      title: true,
      description: true,
      cards: {
        orderBy: { createdAt: "asc" },
        select: { id: true, front: true, back: true },
      },
    },
  });

  if (!deck) notFound();

  const canStartQuiz = deck.cards.length >= QUIZ_MIN_CARDS;
  const cardsNeeded = QUIZ_MIN_CARDS - deck.cards.length;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <Link
          href="/dashboard"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Kembali ke beranda
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Deck
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {deck.title}
            </h1>
            {deck.description ? (
              <p className="max-w-2xl text-sm text-muted-foreground">
                {deck.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-1">
            {canStartQuiz ? (
              <Button asChild size="lg">
                <Link href={`/dashboard/decks/${deck.id}/quiz`}>
                  Mulai Kuis
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" disabled>
                  Mulai Kuis
                </Button>
                <p className="text-xs text-muted-foreground">
                  Tambah {cardsNeeded} kartu lagi untuk mulai kuis.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total kartu
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
              {deck.cards.length}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Status kuis
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {canStartQuiz ? "Siap dimulai" : `Butuh ${cardsNeeded} lagi`}
            </p>
          </div>
        </div>
      </section>

      <DeckCards deckId={deck.id} initialCards={deck.cards} />
    </div>
  );
}
