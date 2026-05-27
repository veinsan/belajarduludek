import Link from "next/link";
import type { ComponentType } from "react";
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  FilePenLine,
  Flame,
  Grid2X2,
  PlaySquare,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { Reveal } from "@/components/reveal";

const SHORTCUTS = [
  {
    href: "/dashboard/kelas",
    icon: PlaySquare,
    label: "Kelas",
    description: "Video materi MIPA",
  },
  {
    href: "/dashboard/tryout",
    icon: FilePenLine,
    label: "Try Out",
    description: "Uji kemampuanmu",
  },
  {
    href: "/dashboard/gemini",
    icon: Bot,
    label: "Gemini AI",
    description: "Chatbot teman belajarmu",
  },
  {
    href: "/dashboard/materials",
    icon: BookOpen,
    label: "Perpustakaan",
    description: "Text book, rangkuman, bank soal",
  },
  {
    href: "/dashboard/rangkum",
    icon: Grid2X2,
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
    <div className="flex min-w-0 flex-col gap-8 md:gap-10">
      <Reveal
        as="section"
        className="liquid-glass liquid-hero neon-edge grid min-h-[200px] gap-6 rounded-[1.4rem] px-6 py-7 md:grid-cols-[minmax(0,1fr)_auto] md:px-10 md:py-10"
      >
        <div className="flex min-w-0 flex-col justify-center gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
              Mau Belajar{" "}
              <span className="text-primary-light">
                apa Hari ini?
              </span>
            </h1>
            <p className="text-lg font-medium text-white/74">
              Halo, {firstName}. <span aria-hidden>👋</span>
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-white/62 md:text-base">
              Pilih aktivitas belajar yang mau kamu lanjutkan.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 self-center md:w-[300px]">
          <StatGlass
            icon={Flame}
            label="hari streak"
            value={currentStreak}
            tone="text-amber-200"
          />
          <StatGlass
            icon={BarChart3}
            label="kuis selesai"
            value={totalQuizzes}
            tone="text-primary-light"
          />
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
        aria-label="Pintasan"
      >
        {SHORTCUTS.map((s, index) => {
          const Icon = s.icon;
          return (
          <Link
            key={s.href}
            href={s.href}
            className="liquid-card neon-edge animate-enter-up group flex min-h-[168px] flex-col items-start justify-between overflow-hidden rounded-[1.25rem] p-5 transition-all hover:-translate-y-1 hover:border-primary-light/35 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex w-full items-start justify-between gap-3">
              <span
                aria-hidden
                className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary-light/25 bg-primary/18 text-primary-light shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_28px_rgba(0,0,0,0.18)] transition-transform group-hover:scale-105"
              >
                <Icon className="size-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.13)]" />
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/14 text-primary-light transition-all group-hover:bg-primary/22 group-hover:text-white">
                <ChevronRight className="size-5" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-tight">{s.label}</span>
              <span className="mt-1 text-sm leading-snug text-muted-foreground">
                {s.description}
              </span>
            </div>
          </Link>
          );
        })}
      </Reveal>

      <Reveal>
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
      </Reveal>
    </div>
  );
}

function StatGlass({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.065] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <Icon className={`mb-3 size-5 ${tone}`} />
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="text-xs text-white/62">{label}</p>
    </div>
  );
}
