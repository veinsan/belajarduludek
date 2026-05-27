import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Image as ImageIcon,
  ListChecks,
  MessageSquareText,
  Route,
  Search as SearchIcon,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/search-filter";

type PageProps = {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    sort?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="bg-transparent font-semibold text-amber-300">
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

function snippet(content: string, q: string, len = 170): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx < 0) {
    return content.slice(0, len) + (content.length > len ? " …" : "");
  }
  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + 110);
  return (
    (start > 0 ? "… " : "") +
    content.slice(start, end).trim() +
    (end < content.length ? " …" : "")
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const sp = await searchParams;
  const q = firstParam(sp.q).trim();
  const type = firstParam(sp.type) || "all";
  const sort = firstParam(sp.sort) || "relevan";

  const wantDecks = type === "all" || type === "soal";
  const wantMaterials = type === "all" || type === "materi";
  const wantPaths = type === "all" || type === "path";

  const [decks, materials, paths] = await Promise.all([
    q && wantDecks
      ? prisma.deck.findMany({
          where: {
            userId: session.sub,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: { select: { cards: true, quizzes: true } },
          },
        })
      : Promise.resolve([]),
    q && wantMaterials
      ? prisma.material.findMany({
          where: {
            userId: session.sub,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, title: true, content: true, createdAt: true },
        })
      : Promise.resolve([]),
    q && wantPaths
      ? prisma.learningPath.findMany({
          where: {
            userId: session.sub,
            title: { contains: q, mode: "insensitive" },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: { select: { steps: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  // Apply the chosen sort. The queries return newest-first by default.
  const ql = q.toLowerCase();
  const titleRank = (title: string) => (title.toLowerCase().includes(ql) ? 1 : 0);
  const byNewest = (a: { createdAt: Date }, b: { createdAt: Date }) =>
    b.createdAt.getTime() - a.createdAt.getTime();

  if (sort === "populer") {
    decks.sort((a, b) => b._count.quizzes - a._count.quizzes || byNewest(a, b));
    paths.sort((a, b) => b._count.steps - a._count.steps || byNewest(a, b));
    materials.sort(byNewest);
  } else if (sort === "terbaru") {
    decks.sort(byNewest);
    materials.sort(byNewest);
    paths.sort(byNewest);
  } else {
    // relevan: judul yang cocok diutamakan, lalu yang terbaru
    decks.sort((a, b) => titleRank(b.title) - titleRank(a.title) || byNewest(a, b));
    materials.sort(
      (a, b) => titleRank(b.title) - titleRank(a.title) || byNewest(a, b)
    );
    paths.sort((a, b) => titleRank(b.title) - titleRank(a.title) || byNewest(a, b));
  }

  const total = decks.length + materials.length + paths.length;

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">
          {q ? `Hasil pencarian untuk "${q}"` : "Pencarian"}
        </span>
      </nav>

      {/* copilot banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-card/60 p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 size-40 rounded-full bg-primary/10 blur-2xl"
        />
        <p className="relative text-lg font-bold tracking-tight">
          Mau dapet jawaban yang lebih akurat?
        </p>
        <Link
          href="/dashboard/gemini"
          className="relative mt-4 flex items-center justify-center gap-2 rounded-xl border border-border-strong bg-elevated/60 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
        >
          <MessageSquareText className="size-4" />
          Tanya Gemini AI
        </Link>
      </div>

      {/* filter */}
      <SearchFilter q={q} type={type} sort={sort} />

      {/* results */}
      {!q ? (
        <EmptyHint
          title="Mulai pencarian"
          subtitle="Ketik topik, materi, atau soal di kolom pencarian sidebar."
        />
      ) : total === 0 ? (
        <EmptyHint
          title={`Tidak ada hasil untuk "${q}"`}
          subtitle="Coba kata kunci lain atau periksa ejaannya."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="rounded-2xl border border-border-strong bg-card/60 p-6"
            >
              <h3 className="text-xl font-bold tracking-tight">
                {highlight(deck.title, q)}
              </h3>
              <div className="mt-4 flex items-center justify-center rounded-xl bg-elevated/40 py-9">
                <span className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                  <ListChecks className="size-5" />
                  {deck._count.cards} Soal
                </span>
              </div>
              <div className="mt-5 flex items-center gap-5">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                    <div className="h-full w-0 rounded-full bg-primary" />
                  </div>
                </div>
                <Button asChild className="rounded-xl px-7">
                  <Link href={`/dashboard/decks/${deck.id}`}>Mulai</Link>
                </Button>
              </div>
            </div>
          ))}

          {paths.map((path) => (
            <Link
              key={path.id}
              href="/dashboard/paths"
              className="flex items-center gap-4 rounded-2xl border border-border-strong bg-card/60 p-5 transition-colors hover:bg-elevated"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-light">
                <Route className="size-5" />
              </span>
              <div className="flex flex-col">
                <h3 className="font-bold tracking-tight">
                  {highlight(path.title, q)}
                </h3>
                <span className="text-sm text-muted-foreground">
                  Learning path · {path._count.steps} langkah
                </span>
              </div>
            </Link>
          ))}

          {materials.map((material) => (
            <Link
              key={material.id}
              href={`/dashboard/materials/${material.id}`}
              className="flex gap-4 rounded-2xl border border-border-strong bg-card/40 p-4 transition-colors hover:bg-elevated"
            >
              <span className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-elevated text-muted-foreground">
                <ImageIcon className="size-6" />
              </span>
              <div className="flex flex-col gap-1 py-1">
                <h3 className="font-bold tracking-tight">
                  {highlight(material.title, q)}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {highlight(snippet(material.content, q), q)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyHint({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-card/30 px-6 py-16 text-center">
      <span className="text-muted-foreground/70">
        <SearchIcon className="size-9" />
      </span>
      <p className="text-base font-bold tracking-tight">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
