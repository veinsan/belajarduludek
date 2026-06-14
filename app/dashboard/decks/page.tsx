import Link from "next/link";
import { GraduationCap, Layers, NotebookTabs, Plus, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { teacherContentWhere } from "@/lib/access";
import { QUIZ_MIN_CARDS } from "@/lib/quiz";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function DecksPage() {
  const session = await getSession();
  if (!session) return null;

  const [myDecks, teacherDecks] = await Promise.all([
    prisma.deck.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        _count: { select: { cards: true } },
      },
    }),
    prisma.deck.findMany({
      where: teacherContentWhere(session.sub),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        user: { select: { name: true } },
        _count: { select: { cards: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <Reveal as="section" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">
              Flashcard
            </p>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Deck Belajar
            </h1>
            <p className="text-sm text-muted-foreground">
              {myDecks.length} deck milikmu · {teacherDecks.length} deck dari
              guru.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/decks/new">
              <Plus />
              Buat Deck Baru
            </Link>
          </Button>
        </div>
      </Reveal>

      {teacherDecks.length > 0 ? (
        <Reveal as="section" className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl border border-sky-300/25 bg-sky-400/10 text-sky-300">
              <GraduationCap className="size-4.5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">
                Deck dari Guru
              </h2>
              <p className="text-xs text-muted-foreground">
                Disusun gurumu, langsung bisa dipelajari.
              </p>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teacherDecks.map((deck, index) => (
              <li key={deck.id} className="animate-enter-up" style={{ animationDelay: `${index * 60}ms` }}>
                <DeckGridCard
                  id={deck.id}
                  title={deck.title}
                  description={deck.description}
                  cardCount={deck._count.cards}
                  createdAt={deck.createdAt}
                  ownerName={deck.user.name}
                />
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <Reveal
        as="section"
        className={cn(
          "flex flex-col gap-4",
          teacherDecks.length > 0 && "border-t border-border pt-8"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl border border-primary-light/25 bg-primary/18 text-primary-light">
            <NotebookTabs className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">
              Deck Saya
            </h2>
            <p className="text-xs text-muted-foreground">
              Koleksi buatanmu sendiri, bebas diubah kapan aja.
            </p>
          </div>
        </div>
        {myDecks.length === 0 ? (
          <div className="liquid-card flex flex-col items-center gap-3 rounded-[1.25rem] border-dashed px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl border border-primary-light/25 bg-primary/15 text-primary-light">
              <Sparkles className="size-7" />
            </span>
            <div>
              <p className="text-lg font-bold">Belum ada deck buatanmu</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Bikin deck flashcard sendiri, atau generate otomatis dari materi
                dengan bantuan AI.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/dashboard/decks/new">Buat deck pertama</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/materials">Generate dari materi</Link>
              </Button>
            </div>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myDecks.map((deck, index) => (
              <li key={deck.id} className="animate-enter-up" style={{ animationDelay: `${index * 60}ms` }}>
                <DeckGridCard
                  id={deck.id}
                  title={deck.title}
                  description={deck.description}
                  cardCount={deck._count.cards}
                  createdAt={deck.createdAt}
                />
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </div>
  );
}

function DeckGridCard({
  id,
  title,
  description,
  cardCount,
  createdAt,
  ownerName,
}: {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
  createdAt: Date;
  ownerName?: string;
}) {
  const quizReady = cardCount >= QUIZ_MIN_CARDS;
  const fromTeacher = Boolean(ownerName);
  return (
    <Link
      href={`/dashboard/decks/${id}`}
      className="group block h-full rounded-[1.25rem] outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card
        className={cn(
          "liquid-card flex h-full min-h-[176px] flex-col justify-between gap-4 rounded-[1.25rem] p-5 transition-all duration-300 group-hover:-translate-y-1",
          fromTeacher
            ? "group-hover:border-sky-300/40"
            : "group-hover:border-primary-light/35"
        )}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            {fromTeacher ? (
              <span className="flex w-fit min-w-0 items-center gap-1 rounded-full border border-sky-300/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                <GraduationCap className="size-3 shrink-0" aria-hidden />
                <span className="truncate">{ownerName}</span>
              </span>
            ) : (
              <span className="flex w-fit items-center gap-1 rounded-full border border-primary-light/25 bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
                <NotebookTabs className="size-3" aria-hidden />
                Milikku
              </span>
            )}
            {quizReady ? (
              <span className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                Siap kuis
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Belum siap kuis
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-lg font-bold leading-snug transition-colors duration-200 group-hover:text-white">
            {title}
          </p>
          {description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t border-white/8 pt-3">
          <span className="flex items-center gap-1.5 text-xs font-bold tabular-nums">
            <Layers
              className={cn(
                "size-3.5",
                fromTeacher ? "text-sky-300" : "text-primary-light"
              )}
              aria-hidden
            />
            {cardCount} kartu
          </span>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {dateFormatter.format(createdAt)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
