import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardRow } from "@/components/card-row";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function RangkumPage() {
  const session = await getSession();
  if (!session) return null;

  const [materials, decks, paths] = await Promise.all([
    prisma.material.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        createdAt: true,
        summary: true,
      },
    }),
    prisma.deck.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        description: true,
        _count: { select: { cards: true } },
      },
    }),
    prisma.learningPath.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        _count: { select: { steps: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Belajar mandiri
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Rangkum Materi
            </h1>
            <p className="text-sm text-muted-foreground">
              Materi, flashcard, dan jalur belajar — semua di satu tempat.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/materials/new">Materi baru</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/decks/new">Deck baru</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/paths/new">Jalur baru</Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
          <StatPill label="Materi" value={materials.length} />
          <StatPill label="Deck" value={decks.length} />
          <StatPill label="Jalur" value={paths.length} />
        </div>
      </section>

      <CardRow
        title="Materi"
        viewAllHref="/dashboard/materials"
        viewAllLabel="Lihat semua materi"
      >
        {materials.length === 0 ? (
          <EmptySlot
            title="Belum ada materi"
            description="Simpan catatan atau ringkasan pelajaran."
            ctaHref="/dashboard/materials/new"
            ctaLabel="Tambah materi"
          />
        ) : (
          materials.map((material) => (
            <MaterialCard
              key={material.id}
              id={material.id}
              title={material.title}
              createdAt={material.createdAt}
              hasSummary={Boolean(material.summary)}
            />
          ))
        )}
      </CardRow>

      <CardRow
        title="Deck & Flashcard"
        viewAllHref="/dashboard"
        viewAllLabel="Lihat di beranda"
      >
        {decks.length === 0 ? (
          <EmptySlot
            title="Belum ada deck"
            description="Bikin flashcard untuk drill materi."
            ctaHref="/dashboard/decks/new"
            ctaLabel="Buat deck"
          />
        ) : (
          decks.map((deck) => (
            <DeckCard
              key={deck.id}
              id={deck.id}
              title={deck.title}
              description={deck.description}
              cardCount={deck._count.cards}
            />
          ))
        )}
      </CardRow>

      <CardRow
        title="Jalur Belajar"
        viewAllHref="/dashboard/paths"
        viewAllLabel="Lihat semua jalur"
      >
        {paths.length === 0 ? (
          <EmptySlot
            title="Belum ada jalur"
            description="Urutkan deck jadi jalur belajar bertahap."
            ctaHref="/dashboard/paths/new"
            ctaLabel="Buat jalur"
          />
        ) : (
          paths.map((path) => (
            <PathCard
              key={path.id}
              id={path.id}
              title={path.title}
              stepCount={path._count.steps}
            />
          ))
        )}
      </CardRow>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
        {value}
      </p>
    </div>
  );
}

function MaterialCard({
  id,
  title,
  createdAt,
  hasSummary,
}: {
  id: string;
  title: string;
  createdAt: Date;
  hasSummary: boolean;
}) {
  return (
    <Link
      href={`/dashboard/materials/${id}`}
      className="group block w-[260px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="flex h-[160px] flex-col justify-between p-5 transition-colors group-hover:border-border-strong group-hover:bg-elevated">
        <div className="flex flex-col gap-2">
          {hasSummary ? (
            <span className="w-fit rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
              Diringkas
            </span>
          ) : (
            <span className="w-fit rounded-full border border-border-strong px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Belum diringkas
            </span>
          )}
          <p className="line-clamp-2 text-base font-bold leading-snug">
            {title}
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {dateFormatter.format(createdAt)}
        </p>
      </Card>
    </Link>
  );
}

function DeckCard({
  id,
  title,
  description,
  cardCount,
}: {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
}) {
  return (
    <Link
      href={`/dashboard/decks/${id}`}
      className="group block w-[260px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="flex h-[160px] flex-col justify-between p-5 transition-colors group-hover:border-border-strong group-hover:bg-elevated">
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
            Deck
          </span>
          <p className="line-clamp-2 text-base font-bold leading-snug">
            {title}
          </p>
          {description ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {cardCount} kartu
        </p>
      </Card>
    </Link>
  );
}

function PathCard({
  id,
  title,
  stepCount,
}: {
  id: string;
  title: string;
  stepCount: number;
}) {
  return (
    <Link
      href={`/dashboard/paths/${id}`}
      className="group block w-[260px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="flex h-[160px] flex-col justify-between p-5 transition-colors group-hover:border-border-strong group-hover:bg-elevated">
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
            Jalur
          </span>
          <p className="line-clamp-2 text-base font-bold leading-snug">
            {title}
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {stepCount} langkah
        </p>
      </Card>
    </Link>
  );
}

function EmptySlot({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-xl border border-dashed border-border-strong bg-card/40 p-5">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Button asChild size="sm" className="mt-3 w-fit">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
