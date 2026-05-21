import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DashboardTabs } from "@/components/dashboard-tabs";

const SHORTCUTS = [
  {
    href: "/dashboard/kelas",
    icon: "📚",
    label: "Kelas",
    description: "Video materi MIPA",
  },
  {
    href: "/dashboard/tryout",
    icon: "📝",
    label: "Try Out",
    description: "Uji kemampuanmu",
  },
  {
    href: "/dashboard/gemini",
    icon: "🤖",
    label: "Copilot AI",
    description: "Chatbot teman belajarmu",
  },
  {
    href: "/dashboard/materials",
    icon: "📕",
    label: "Perpustakaan",
    description: "Text book, rangkuman, bank soal",
  },
  {
    href: "/dashboard/rangkum",
    icon: "▦",
    label: "Lainnya",
    description: "Fitur belajar lain",
  },
];

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [decks, materials, paths, stats] = await Promise.all([
    prisma.deck.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        _count: { select: { cards: true } },
      },
    }),
    prisma.material.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, createdAt: true, summary: true },
    }),
    prisma.learningPath.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        _count: { select: { steps: true } },
      },
    }),
    prisma.userStats.findUnique({
      where: { userId: session.sub },
      select: { currentStreak: true, totalQuizzes: true },
    }),
  ]);

  const firstName = session.name.split(" ")[0];
  const currentStreak = stats?.currentStreak ?? 0;
  const totalQuizzes = stats?.totalQuizzes ?? 0;

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">
          Mau Belajar apa Hari ini?
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground md:text-base">
          Halo, {firstName}. Pilih aktivitas belajar yang mau kamu lanjutkan.
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">🔥 {currentStreak}</span>{" "}
          hari streak
          <span className="mx-2 text-border-strong">·</span>
          <span className="font-medium text-foreground">📊 {totalQuizzes}</span>{" "}
          kuis selesai
        </p>
      </section>

      <section
        className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5"
        aria-label="Pintasan"
      >
        {SHORTCUTS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex min-h-[130px] items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight">{s.label}</span>
              <span className="text-sm leading-snug text-muted-foreground">
                {s.description}
              </span>
            </div>
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-2xl"
            >
              {s.icon}
            </span>
          </Link>
        ))}
      </section>

      <DashboardTabs
        decks={decks.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          cardCount: d._count.cards,
        }))}
        materials={materials.map((m) => ({
          id: m.id,
          title: m.title,
          createdAt: m.createdAt,
          hasSummary: Boolean(m.summary),
        }))}
        paths={paths.map((p) => ({
          id: p.id,
          title: p.title,
          stepCount: p._count.steps,
        }))}
      />
    </div>
  );
}
