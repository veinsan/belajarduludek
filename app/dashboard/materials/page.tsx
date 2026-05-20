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

export default async function MaterialsPage() {
  const session = await getSession();
  if (!session) return null;

  const materials = await prisma.material.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      summary: true,
    },
  });

  const summarizedCount = materials.filter((m) => m.summary).length;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Perpustakaan
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Materi
            </h1>
            <p className="text-sm text-muted-foreground">
              {materials.length} materi tersimpan
              {summarizedCount > 0
                ? ` · ${summarizedCount} sudah diringkas AI`
                : ""}
              .
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/materials/new">Buat Materi Baru</Link>
          </Button>
        </div>
      </section>

      <CardRow
        title="Semua materi"
        viewAllHref="/dashboard/materials/new"
        viewAllLabel="Tambah materi"
      >
        {materials.length === 0 ? (
          <EmptySlot />
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

function EmptySlot() {
  return (
    <div className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-xl border border-dashed border-border-strong bg-card/40 p-5">
      <div>
        <p className="text-sm font-semibold">Belum ada materi</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Simpan catatan atau ringkasan pelajaran pertamamu.
        </p>
      </div>
      <Button asChild size="sm" className="mt-3 w-fit">
        <Link href="/dashboard/materials/new">Buat materi</Link>
      </Button>
    </div>
  );
}
