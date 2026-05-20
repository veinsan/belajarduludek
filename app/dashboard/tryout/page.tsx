import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TryoutRunner } from "@/components/tryout-runner";

export default async function TryoutPage() {
  const session = await getSession();
  if (!session) return null;

  const decks = await prisma.deck.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      cards: {
        orderBy: { createdAt: "asc" },
        select: { id: true, front: true, back: true },
      },
    },
  });

  const eligibleDecks = decks.filter((d) => d.cards.length > 0);
  const totalCards = eligibleDecks.reduce(
    (sum, d) => sum + d.cards.length,
    0
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Latihan gabungan
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Tryout
          </h1>
          <p className="text-sm text-muted-foreground">
            Gabungkan beberapa deck jadi satu kuis besar — cocok untuk
            persiapan ulangan atau UTBK.
          </p>
        </div>
        {eligibleDecks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Deck siap
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
                {eligibleDecks.length}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Total kartu
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
                {totalCards}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {eligibleDecks.length > 0 ? (
        <TryoutRunner decks={decks} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada deck untuk tryout</CardTitle>
            <CardDescription>
              Buat deck dan tambahkan kartu dulu untuk bisa memulai tryout
              gabungan.
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Button asChild>
              <Link href="/dashboard/decks/new">Buat deck pertama</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
