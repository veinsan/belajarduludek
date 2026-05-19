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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar deck
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{deck.title}</h1>
          {deck.description ? (
            <p className="text-sm text-muted-foreground">{deck.description}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1">
          {canStartQuiz ? (
            <Button asChild size="lg">
              <Link href={`/dashboard/decks/${deck.id}/quiz`}>Mulai Kuis</Link>
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

      <DeckCards deckId={deck.id} initialCards={deck.cards} />
    </div>
  );
}
