import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
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

  const hasEligibleDecks = decks.some((d) => d.cards.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Kembali ke dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Tryout</h1>
        <p className="text-sm text-muted-foreground">
          Gabungkan beberapa deck jadi satu kuis besar.
        </p>
      </div>
      {hasEligibleDecks ? (
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
        </Card>
      )}
    </div>
  );
}
