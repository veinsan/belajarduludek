import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { QUIZ_MIN_CARDS, generateQuizQuestions } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizRunner } from "@/components/quiz-runner";

type PageProps = { params: Promise<{ id: string }> };

export default async function QuizPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const deck = await prisma.deck.findFirst({
    where: { id, userId: session.sub },
    select: {
      id: true,
      title: true,
      cards: { select: { id: true, front: true, back: true } },
    },
  });

  if (!deck) notFound();

  if (deck.cards.length < QUIZ_MIN_CARDS) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href={`/dashboard/decks/${deck.id}`}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Kembali ke deck
        </Link>
        <Card className="mx-auto w-full max-w-xl">
          <CardHeader>
            <CardTitle>Belum bisa memulai kuis</CardTitle>
            <CardDescription>
              Deck &quot;{deck.title}&quot; baru punya {deck.cards.length} kartu.
              Tambahkan minimal {QUIZ_MIN_CARDS} kartu untuk memulai kuis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Setiap soal kuis butuh 1 jawaban benar dan 3 pengecoh, jadi minimal
              perlu {QUIZ_MIN_CARDS} kartu.
            </p>
          </CardContent>
          <CardFooter className="justify-end">
            <Button asChild>
              <Link href={`/dashboard/decks/${deck.id}`}>Tambah kartu</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const questions = generateQuizQuestions(deck.cards);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/dashboard/decks/${deck.id}`}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Kembali ke deck
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Kuis: {deck.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih jawaban yang paling tepat. Setiap soal hanya bisa dijawab sekali.
        </p>
      </div>
      <QuizRunner
        deckId={deck.id}
        deckTitle={deck.title}
        questions={questions}
      />
    </div>
  );
}
