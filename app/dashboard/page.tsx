import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  FilePenLine,
  FileText,
  Flame,
  GraduationCap,
  Grid2X2,
  Layers,
  NotebookTabs,
  PlaySquare,
  Plus,
  Presentation,
  Trophy,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { teacherContentWhere } from "@/lib/access";
import { cn } from "@/lib/utils";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { Reveal } from "@/components/reveal";

const SHORTCUTS = [
  {
    href: "/dashboard/decks",
    icon: NotebookTabs,
    label: "Deck",
    description: "Flashcard untuk drill materi",
  },
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

  const isTeacher = session.role === "GURU" || session.role === "SUPERADMIN";

  const [decks, deckCount, materials, paths, stats, quizzes, lastQuiz, teacherDecks, teacherMaterials] =
    await Promise.all([
      prisma.deck.findMany({
        where: { userId: session.sub },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          _count: { select: { cards: true } },
        },
      }),
      prisma.deck.count({ where: { userId: session.sub } }),
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
      prisma.quiz.findMany({
        where: { userId: session.sub },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { score: true, total: true },
      }),
      prisma.quiz.findFirst({
        where: { userId: session.sub },
        orderBy: { createdAt: "desc" },
        select: {
          createdAt: true,
          score: true,
          total: true,
          deck: { select: { id: true, title: true } },
        },
      }),
      prisma.deck.findMany({
        where: teacherContentWhere(session.sub),
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: { select: { name: true } },
          _count: { select: { cards: true } },
        },
      }),
      prisma.material.findMany({
        where: teacherContentWhere(session.sub),
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
    ]);

  // Statistik engagement guru: pengerjaan kuis di deck miliknya oleh murid.
  const engagement = isTeacher
    ? await prisma.quiz.findMany({
        where: { deck: { userId: session.sub }, userId: { not: session.sub } },
        select: { userId: true },
      })
    : [];
  const attemptCount = engagement.length;
  const studentCount = new Set(engagement.map((q) => q.userId)).size;

  const firstName = session.name.split(" ")[0];
  const currentStreak = stats?.currentStreak ?? 0;
  const totalQuizzes = stats?.totalQuizzes ?? 0;
  const bestScore = quizzes.reduce(
    (best, q) => Math.max(best, Math.round((q.score / q.total) * 100)),
    0
  );

  // "Lanjutkan dari terakhir kali" — aktivitas terbaru di antara kuis,
  // deck, dan materi milik user.
  const continueCandidates = [
    lastQuiz
      ? {
          at: lastQuiz.createdAt,
          href: `/dashboard/decks/${lastQuiz.deck.id}`,
          kind: "Kuis terakhir",
          title: lastQuiz.deck.title,
          detail: `Skor terakhirmu ${Math.round((lastQuiz.score / lastQuiz.total) * 100)}%, coba lampaui!`,
          icon: Trophy,
        }
      : null,
    decks[0]
      ? {
          at: decks[0].createdAt,
          href: `/dashboard/decks/${decks[0].id}`,
          kind: "Deck terbaru",
          title: decks[0].title,
          detail: `${decks[0]._count.cards} kartu siap dipelajari.`,
          icon: NotebookTabs,
        }
      : null,
    materials[0]
      ? {
          at: materials[0].createdAt,
          href: `/dashboard/materials/${materials[0].id}`,
          kind: "Materi terbaru",
          title: materials[0].title,
          detail: materials[0].summary
            ? "Sudah ada ringkasan AI, lanjut ke kuis?"
            : "Belum diringkas, coba ringkasan AI.",
          icon: FileText,
        }
      : null,
  ].filter((c) => c !== null);
  const continueItem =
    continueCandidates.sort((a, b) => b.at.getTime() - a.at.getTime())[0] ??
    null;

  const teacherFeed = [
    ...teacherDecks.map((d) => ({
      at: d.createdAt,
      href: `/dashboard/decks/${d.id}`,
      title: d.title,
      owner: d.user.name,
      detail: `${d._count.cards} kartu`,
      icon: NotebookTabs,
    })),
    ...teacherMaterials.map((m) => ({
      at: m.createdAt,
      href: `/dashboard/materials/${m.id}`,
      title: m.title,
      owner: m.user.name,
      detail: "Materi",
      icon: FileText,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 4);

  return (
    <div className="flex min-w-0 flex-col gap-8 md:gap-10">
      <Reveal
        as="section"
        className="liquid-glass liquid-hero neon-edge grid min-h-[200px] gap-6 rounded-[1.4rem] px-6 py-7 md:grid-cols-[minmax(0,1fr)_auto] md:px-10 md:py-10"
      >
        <div className="flex min-w-0 flex-col justify-center gap-4">
          <div className="flex flex-col gap-3">
            <span
              className={cn(
                "flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                isTeacher
                  ? "border-sky-300/30 bg-sky-400/10 text-sky-300"
                  : "border-primary-light/30 bg-primary/15 text-primary-light"
              )}
            >
              {isTeacher ? (
                <Presentation className="size-3.5" />
              ) : (
                <GraduationCap className="size-3.5" />
              )}
              {session.role === "SUPERADMIN"
                ? "Admin"
                : session.role === "GURU"
                  ? "Guru"
                  : "Murid"}
            </span>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
              Halo, <span className="text-primary-light">{firstName}!</span>
              <br />
              {isTeacher
                ? "Siap mengajar hari ini?"
                : "Mau belajar apa hari ini?"}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/62 md:text-base">
              {isTeacher
                ? "Buat deck dan materi baru, lalu pantau progres murid-muridmu."
                : "Pilih aktivitas belajar yang mau kamu lanjutkan."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 self-center md:w-[320px]">
          <div className="flex items-center gap-4 rounded-2xl border border-amber-200/20 bg-white/[0.065] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-amber-200/25 bg-amber-400/15 text-amber-200">
              <Flame className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-3xl font-black leading-none tracking-tight tabular-nums">
                {currentStreak}
                <span className="ml-1.5 text-sm font-bold text-white/62">
                  hari streak
                </span>
              </p>
              <p className="mt-1.5 truncate text-xs text-white/62">
                {currentStreak > 0
                  ? "Jaga terus, jangan putus!"
                  : "Kerjakan satu kuis buat mulai."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatGlass
              icon={BarChart3}
              label="kuis selesai"
              value={totalQuizzes}
              tone="text-primary-light"
            />
            <StatGlass
              icon={Layers}
              label="deck dibuat"
              value={deckCount}
              tone="text-sky-300"
            />
            <StatGlass
              icon={Trophy}
              label="skor terbaik"
              value={totalQuizzes > 0 ? `${bestScore}%` : "—"}
              tone="text-emerald-300"
            />
          </div>
        </div>
      </Reveal>

      {continueItem || isTeacher || teacherFeed.length > 0 ? (
        <Reveal
          as="section"
          className={cn(
            "grid min-w-0 gap-4",
            continueItem &&
              (isTeacher || teacherFeed.length > 0) &&
              "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
          )}
        >
          {continueItem ? (
            <Link
              href={continueItem.href}
              className="liquid-card neon-edge group relative isolate flex items-center gap-5 overflow-hidden rounded-[1.25rem] border-primary-light/30 p-5 transition-all hover:-translate-y-0.5 hover:border-primary-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:p-6"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-primary/[0.16] via-primary/[0.05] to-transparent"
              />
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary-light/30 bg-primary/25 text-primary-light shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_28px_rgba(95,43,206,0.25)] transition-transform duration-200 group-hover:scale-105">
                <continueItem.icon className="size-7" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-light">
                  Lanjutkan dari terakhir kali · {continueItem.kind}
                </p>
                <p className="mt-1 truncate text-xl font-bold leading-tight md:text-2xl">
                  {continueItem.title}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {continueItem.detail}
                </p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary-light transition-all duration-200 group-hover:bg-primary group-hover:text-white">
                <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ) : null}

          {isTeacher ? (
            <div className="liquid-card neon-edge flex flex-col justify-between gap-4 rounded-[1.25rem] border-sky-300/20 p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">
                    Dampakmu sebagai pengajar
                  </p>
                  <div className="mt-3 flex items-start gap-6">
                    <div>
                      <p className="text-4xl font-black leading-none tracking-tight tabular-nums md:text-5xl">
                        {attemptCount}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        kuis dikerjakan murid
                      </p>
                    </div>
                    <div className="border-l border-white/10 pl-6">
                      <p className="text-4xl font-black leading-none tracking-tight tabular-nums md:text-5xl">
                        {studentCount}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        murid belajar dari kontenmu
                      </p>
                    </div>
                  </div>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-sky-300/25 bg-sky-400/10 text-sky-300">
                  <Users className="size-5" />
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/decks/new"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
                >
                  <Plus className="size-4" />
                  Buat Deck
                </Link>
                <Link
                  href="/dashboard/materials/new"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/30 bg-sky-400/10 px-3.5 py-2 text-sm font-semibold text-sky-300 transition-colors hover:bg-sky-400/20"
                >
                  <Plus className="size-4" />
                  Buat Materi
                </Link>
              </div>
            </div>
          ) : teacherFeed.length > 0 ? (
            <div className="liquid-card neon-edge flex flex-col gap-3 rounded-[1.25rem] border-sky-300/20 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">
                  <GraduationCap className="size-4" />
                  Baru dari Guru
                </p>
                <Link
                  href="/dashboard/decks"
                  className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Lihat semua
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <ul className="flex flex-col gap-1.5">
                {teacherFeed.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-sky-300/20 bg-sky-400/10 text-sky-300">
                        <item.icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {item.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.owner} · {item.detail}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Reveal>
      ) : null}

      <Reveal
        as="section"
        className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"
        aria-label="Pintasan"
      >
        {SHORTCUTS.map((s, index) => {
          const Icon = s.icon;
          return (
          <Link
            key={s.href}
            href={s.href}
            className="liquid-card neon-edge animate-enter-up group relative isolate flex min-h-[168px] flex-col items-start justify-between overflow-hidden rounded-[1.25rem] p-5 transition-all hover:-translate-y-1 hover:border-primary-light/35 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <Icon
              aria-hidden
              className="pointer-events-none absolute -bottom-7 -right-7 -z-10 size-28 -rotate-12 text-primary-light/[0.07] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110"
            />
            <div className="flex w-full items-start justify-between gap-3">
              <span
                aria-hidden
                className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary-light/25 bg-primary/18 text-primary-light shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_28px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover:scale-105"
              >
                <Icon className="size-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.13)]" />
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/14 text-primary-light transition-all duration-200 group-hover:bg-primary/22 group-hover:text-white">
                <ChevronRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
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
  value: number | string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.065] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <Icon className={`mb-2.5 size-4 ${tone}`} aria-hidden />
      <p className="text-xl font-black leading-none tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-[10px] leading-tight text-white/62">{label}</p>
    </div>
  );
}
