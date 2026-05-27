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
import { Reveal } from "@/components/reveal";

export default async function TryoutPage() {
  const session = await getSession();
  if (!session) return null;

  const [decks, adminTryouts] = await Promise.all([
    prisma.deck.findMany({
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
    }),
    prisma.adminTryout.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        durationMinutes: true,
        questions: true,
      },
    }),
  ]);

  const eligibleDecks = decks.filter((d) => d.cards.length > 0);
  const totalCards = eligibleDecks.reduce(
    (sum, d) => sum + d.cards.length,
    0
  );

  return (
    <div className="flex flex-col gap-10">
      <Reveal as="section" className="flex flex-col gap-5">
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
            <div className="animate-enter-up rounded-xl border bg-card p-4 transition-transform hover:-translate-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Deck siap
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
                {eligibleDecks.length}
              </p>
            </div>
            <div className="animate-enter-up animation-delay-100 rounded-xl border bg-card p-4 transition-transform hover:-translate-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Total kartu
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
                {totalCards}
              </p>
            </div>
          </div>
        ) : null}
      </Reveal>

      {adminTryouts.length > 0 ? (
        <Reveal delay={80}>
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">
                Tryout dari admin
              </h2>
              <p className="text-xs text-muted-foreground">
                Paket latihan yang disiapkan admin untuk semua pengguna.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {adminTryouts.map((tryout) => {
                const count = Array.isArray(tryout.questions)
                  ? tryout.questions.length
                  : 0;
                return (
                  <Card key={tryout.id}>
                    <CardHeader>
                      <CardTitle className="leading-snug">
                        {tryout.title}
                      </CardTitle>
                      <CardDescription>
                        {tryout.description ?? "Paket tryout siap dikerjakan."}
                      </CardDescription>
                    </CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-6">
                      <p className="text-xs text-muted-foreground">
                        {count} soal
                        {tryout.durationMinutes
                          ? ` · ${tryout.durationMinutes} menit`
                          : ""}
                      </p>
                      <Button asChild size="sm">
                        <Link href={`/dashboard/tryout/${tryout.id}`}>
                          Mulai
                        </Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </Reveal>
      ) : null}

      {eligibleDecks.length > 0 ? (
        <Reveal delay={120}>
          <TryoutRunner decks={decks} />
        </Reveal>
      ) : (
        <Reveal>
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
        </Reveal>
      )}
    </div>
  );
}
