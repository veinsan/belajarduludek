import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { teacherContentWhere } from "@/lib/access";
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

  const [materials, teacherMaterials, books] = await Promise.all([
    prisma.material.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        summary: true,
      },
    }),
    prisma.material.findMany({
      where: teacherContentWhere(session.sub),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        summary: true,
        user: { select: { name: true } },
      },
    }),
    prisma.adminBook
      .findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          coverUrl: true,
          pdfUrl: true,
          updatedAt: true,
        },
      })
      .catch(() => []),
  ]);

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

      {teacherMaterials.length > 0 ? (
        <CardRow title="Materi dari Guru">
          {teacherMaterials.map((material) => (
            <TeacherMaterialCard
              key={material.id}
              id={material.id}
              title={material.title}
              createdAt={material.createdAt}
              hasSummary={Boolean(material.summary)}
              ownerName={material.user.name}
            />
          ))}
        </CardRow>
      ) : null}

      {books.length > 0 ? (
        <CardRow
          title="Buku dari admin"
          viewAllHref="/dashboard/materials"
          viewAllLabel="Perpustakaan"
        >
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              description={book.description}
              coverUrl={book.coverUrl}
              hasPdf={Boolean(book.pdfUrl)}
              updatedAt={book.updatedAt}
            />
          ))}
        </CardRow>
      ) : null}

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

function TeacherMaterialCard({
  id,
  title,
  createdAt,
  hasSummary,
  ownerName,
}: {
  id: string;
  title: string;
  createdAt: Date;
  hasSummary: boolean;
  ownerName: string;
}) {
  return (
    <Link
      href={`/dashboard/materials/${id}`}
      className="group block w-[260px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="flex h-[160px] flex-col justify-between border-sky-300/20 p-5 transition-colors group-hover:border-sky-300/40 group-hover:bg-elevated">
        <div className="flex flex-col gap-2">
          <span className="flex w-fit items-center gap-1 rounded-full border border-sky-300/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
            <GraduationCap className="size-3" aria-hidden />
            {ownerName}
          </span>
          <p className="line-clamp-2 text-base font-bold leading-snug">
            {title}
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{dateFormatter.format(createdAt)}</span>
          {hasSummary ? (
            <span className="text-primary-light">Diringkas</span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}

function BookCard({
  id,
  title,
  author,
  description,
  coverUrl,
  hasPdf,
  updatedAt,
}: {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  coverUrl: string | null;
  hasPdf: boolean;
  updatedAt: Date;
}) {
  return (
    <Link
      href={`/dashboard/books/${id}`}
      className="group block w-[280px] shrink-0 snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Card className="flex h-[190px] flex-row overflow-hidden p-0 transition-colors group-hover:border-border-strong group-hover:bg-elevated">
        <div className="w-24 shrink-0 bg-elevated">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs font-semibold text-primary">
              Buku
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div className="flex flex-col gap-2">
            <span className="w-fit rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
              {hasPdf ? "PDF admin" : "Buku admin"}
            </span>
            <p className="line-clamp-2 text-base font-bold leading-snug">
              {title}
            </p>
            {author ? (
              <p className="truncate text-xs text-muted-foreground">
                {author}
              </p>
            ) : null}
            {description ? (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {dateFormatter.format(updatedAt)}
          </p>
        </div>
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
