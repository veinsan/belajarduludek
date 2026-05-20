import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardRow } from "@/components/card-row";

export default async function PathsPage() {
  const session = await getSession();
  if (!session) return null;

  const paths = await prisma.learningPath.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      _count: { select: { steps: true } },
    },
  });

  const totalSteps = paths.reduce((sum, p) => sum + p._count.steps, 0);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Rencana belajar
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Jalur belajar
            </h1>
            <p className="text-sm text-muted-foreground">
              {paths.length} jalur · {totalSteps} langkah total.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/paths/new">Buat Jalur Baru</Link>
          </Button>
        </div>
      </section>

      <CardRow
        title="Semua jalur"
        viewAllHref="/dashboard/paths/new"
        viewAllLabel="Buat jalur"
      >
        {paths.length === 0 ? (
          <EmptySlot />
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

function EmptySlot() {
  return (
    <div className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-xl border border-dashed border-border-strong bg-card/40 p-5">
      <div>
        <p className="text-sm font-semibold">Belum ada jalur</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Urutkan deck jadi jalur belajar bertahap.
        </p>
      </div>
      <Button asChild size="sm" className="mt-3 w-fit">
        <Link href="/dashboard/paths/new">Buat jalur</Link>
      </Button>
    </div>
  );
}
