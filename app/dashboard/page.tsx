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

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [decks, stats] = await Promise.all([
    prisma.deck.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        _count: { select: { cards: true } },
      },
    }),
    prisma.userStats.findUnique({
      where: { userId: session.sub },
      select: { currentStreak: true, totalQuizzes: true },
    }),
  ]);

  const currentStreak = stats?.currentStreak ?? 0;
  const totalQuizzes = stats?.totalQuizzes ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Streak saat ini
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            {currentStreak}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              hari
            </span>
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Total kuis
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            {totalQuizzes}
          </p>
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deck kamu</h1>
          <p className="text-sm text-muted-foreground">
            Kumpulan flashcard yang sudah kamu buat.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/decks/new">Buat Deck Baru</Link>
        </Button>
      </div>

      {decks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada deck</CardTitle>
            <CardDescription>
              Mulai dengan membuat deck pertamamu untuk menyimpan flashcard.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <li key={deck.id}>
              <Link
                href={`/dashboard/decks/${deck.id}`}
                className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{deck.title}</CardTitle>
                    {deck.description ? (
                      <CardDescription className="line-clamp-3">
                        {deck.description}
                      </CardDescription>
                    ) : null}
                    <CardDescription className="pt-2 text-xs">
                      {deck._count.cards} kartu
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
