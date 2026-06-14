import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BrainCircuit,
  Check,
  ClipboardCheck,
  FileText,
  GraduationCap,
  NotebookTabs,
  Presentation,
  Sparkles,
  Upload,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";

const features = [
  {
    number: "01",
    title: "Upload materi",
    icon: Upload,
    description:
      "Masukin catatan, PDF, foto papan tulis, atau materi sekolah. Semua rapi di satu tempat.",
  },
  {
    number: "02",
    title: "Ringkasan AI",
    icon: BrainCircuit,
    description:
      "Materi panjang? Biar AI bantu ringkas jadi poin penting yang lebih gampang dipahami.",
  },
  {
    number: "03",
    title: "Flashcard otomatis",
    icon: NotebookTabs,
    description:
      "Ubah materi jadi kartu belajar otomatis biar hafal lebih cepat dan nggak gampang lupa.",
  },
  {
    number: "04",
    title: "Kuis & tryout",
    icon: ClipboardCheck,
    description:
      "Tes pemahaman lewat latihan soal dan tryout biar makin siap pas ulangan atau UTBK.",
  },
];

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-sidebar/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1302px] items-center justify-between gap-4 px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(95,43,206,0.4)]">
              <GraduationCap className="size-4.5" aria-hidden />
            </span>
            BelajarDuluDek
          </Link>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-base text-foreground hover:bg-transparent"
            >
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild size="sm" className="h-8 rounded-lg px-4 text-base">
              <Link href="/register">Daftar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1302px] flex-1 px-5">
        <section className="grid min-h-[650px] items-center gap-12 overflow-hidden py-16 lg:grid-cols-[minmax(0,0.96fr)_minmax(380px,0.64fr)] lg:py-10">
          <div className="flex flex-col items-start gap-7">
            <span className="animate-enter-up flex items-center gap-2 rounded-full border border-primary-light/25 bg-primary/12 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary-light">
              <span className="size-1.5 rounded-full bg-primary-light" aria-hidden />
              Untuk siswa SMA Indonesia
            </span>
            <h1 className="animate-enter-up animation-delay-100 text-6xl font-black leading-[0.95] tracking-[-0.03em] md:text-7xl lg:text-[88px]">
              Belajar <span className="text-primary-light">Dulu</span> Dek
              <span className="mt-3 block text-[0.55em] font-bold leading-[1.05] tracking-[-0.01em] text-foreground/55">
                Biar jadi smart kid
              </span>
            </h1>
            <p className="animate-enter-up animation-delay-200 max-w-[58ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
              Upload materi, terus ubah jadi ringkasan, flashcard, dan kuis interaktif.
              Belajar buat ulangan dan UTBK jadi lebih gampang
            </p>
            <div className="animate-enter-up animation-delay-300 flex flex-wrap items-center gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-xl px-5 text-base shadow-[0_12px_34px_rgba(95,43,206,0.28)]"
              >
                <Link href="/register">Mulai gratis</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 rounded-xl border-border bg-background px-5 text-base hover:bg-card"
              >
                <Link href="/login">Sudah punya akun</Link>
              </Button>
            </div>
          </div>

          <LearningPreview />
        </section>

        <Reveal
          as="section"
          className="flex flex-col gap-8 pb-24 pt-5 md:pb-28"
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              Yang kamu dapat
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-[42px]">
              Belajar lebih gampang, bukan lebih banyak
            </h2>
          </div>
          <ul className="flex flex-col border-t border-border">
            {features.map((feature, index) => (
              <Reveal
                key={feature.number}
                as="li"
                delay={index * 80}
              >
                <div className="group grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-x-5 border-b border-border py-9 transition-colors duration-300 hover:bg-card/70 md:grid-cols-[6.5rem_minmax(0,1fr)_auto] md:items-center md:gap-x-8 md:px-4">
                  <span
                    aria-hidden
                    className="font-heading text-4xl font-black leading-none tracking-tight text-foreground/12 transition-colors duration-300 group-hover:text-primary-light/50 md:text-6xl"
                  >
                    {feature.number}
                  </span>
                  <div className="flex min-w-0 flex-col gap-2">
                    <h3 className="text-2xl font-bold tracking-tight md:text-[28px]">
                      {feature.title}
                    </h3>
                    <p className="max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                      {feature.description}
                    </p>
                  </div>
                  <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-card text-primary-light transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/15 group-hover:text-foreground md:flex">
                    <feature.icon className="size-5" aria-hidden />
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" className="flex flex-col gap-8 pb-24">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              Satu platform, dua peran
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-[42px]">
              Guru bikin konten, murid tinggal belajar
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <RoleShowcase
              icon={Presentation}
              accent="sky"
              role="Untuk Guru"
              headline="Susun bahan ajar sekali, dipakai semua murid"
              points={[
                "Buat deck flashcard — bisa dengan gambar di tiap kartu",
                "Tulis materi, biarkan AI yang meringkas",
                "Semua murid langsung melihat konten barumu",
                "Pantau berapa kuis yang dikerjakan muridmu",
              ]}
            />
            <RoleShowcase
              icon={GraduationCap}
              accent="purple"
              role="Untuk Murid"
              headline="Belajar dari konten guru atau bikin punyamu sendiri"
              points={[
                "Temukan deck & materi terbaru dari gurumu",
                "Flashcard interaktif dengan kuis otomatis",
                "Skor, streak, dan progres tercatat otomatis",
                "Ringkasan AI + kuis AI dari materi apa pun",
              ]}
            />
          </div>
        </Reveal>

        <Reveal as="section" className="pb-24">
          <Card className="relative isolate flex min-h-[200px] flex-col items-start justify-center gap-7 overflow-hidden rounded-3xl border-primary-light/30 bg-primary p-10 shadow-[0_30px_90px_rgba(95,43,206,0.35)] md:flex-row md:items-center md:justify-between md:gap-8 md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 -z-10 size-80 rounded-full border border-white/15"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-40 -top-48 -z-10 size-[28rem] rounded-full border border-white/8"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 -z-10 size-64 rounded-full bg-white/10 blur-3xl"
            />
            <div className="flex flex-col gap-2.5">
              <h2 className="max-w-[18ch] text-4xl font-black leading-[1.05] tracking-tight text-primary-foreground md:text-5xl">
                Udah siap mulai belajar?
              </h2>
              <p className="text-lg text-primary-foreground/75">
                Gratis dipakai. Tinggal daftar, upload materi, langsung mulai.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-primary-foreground px-6 text-base font-bold text-primary shadow-[0_14px_36px_rgba(0,0,0,0.25)] hover:bg-primary-foreground/90"
              >
                <Link href="/register">Daftar sekarang</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/35 bg-transparent px-6 text-base font-semibold text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </Card>
        </Reveal>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1302px] flex-col items-start gap-2.5 px-5 py-10">
          <p className="flex items-center gap-2 text-base font-bold">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="size-3.5" aria-hidden />
            </span>
            BelajarDuluDek
          </p>
          <p className="text-sm text-muted-foreground">
            Ringkasan, flashcard, dan latihan soal dalam satu tempat
          </p>
        </div>
      </footer>
    </div>
  );
}

function RoleShowcase({
  icon: Icon,
  accent,
  role,
  headline,
  points,
}: {
  icon: typeof Presentation;
  accent: "sky" | "purple";
  role: string;
  headline: string;
  points: string[];
}) {
  const sky = accent === "sky";
  return (
    <Card
      className={cn(
        "relative isolate flex flex-col gap-7 overflow-hidden rounded-3xl p-8 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 md:p-10",
        sky
          ? "border-sky-300/25 bg-card hover:border-sky-300/45"
          : "border-primary-light/25 bg-card hover:border-primary-light/45"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
          sky ? "via-sky-300/60" : "via-primary-light/60"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b via-transparent to-transparent",
          sky ? "from-sky-400/[0.09]" : "from-primary/[0.14]"
        )}
      />
      <Icon
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-7 -top-7 -z-10 size-36 -rotate-12",
          sky ? "text-sky-300/[0.07]" : "text-primary-light/[0.08]"
        )}
      />
      <div className="flex items-center justify-between gap-4">
        <span
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em]",
            sky
              ? "border-sky-300/30 bg-sky-400/10 text-sky-300"
              : "border-primary-light/30 bg-primary/15 text-primary-light"
          )}
        >
          {role}
        </span>
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
            sky
              ? "border-sky-300/25 bg-sky-400/10 text-sky-300"
              : "border-primary-light/25 bg-primary/15 text-primary-light"
          )}
        >
          <Icon className="size-6" aria-hidden />
        </span>
      </div>
      <h3 className="max-w-[20ch] font-heading text-[26px] font-extrabold leading-[1.15] tracking-tight md:text-3xl">
        {headline}
      </h3>
      <ul className="flex flex-col gap-3.5 border-t border-border pt-6">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                sky
                  ? "bg-sky-400/15 text-sky-300"
                  : "bg-primary/20 text-primary-light"
              )}
            >
              <Check className="size-3" aria-hidden />
            </span>
            <span className="text-base leading-relaxed text-muted-foreground">
              {point}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function LearningPreview() {
  return (
    <div className="animate-enter-up animation-delay-400 hidden lg:block">
      <div className="animate-float-slow relative rounded-[2rem] border border-border-strong bg-card p-5 shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
        <div className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-primary-light/70 to-transparent" />

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              Workspace hari ini
            </p>
            <p className="text-xl font-extrabold tracking-tight">
              Persiapan UTBK
            </p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary-light">
            <Sparkles className="size-5" aria-hidden />
          </span>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <FileText className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold">Ringkasan selesai</p>
                <p className="text-xs text-muted-foreground">
                  Bab Turunan dan Integral
                </p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-elevated">
              <div className="animate-progress h-full rounded-full bg-primary" />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_0.8fr] gap-4">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary-light">
                Flashcard
              </p>
              <div className="space-y-2">
                <div className="h-3 w-4/5 rounded-full bg-muted-foreground/20" />
                <div className="h-3 w-3/5 rounded-full bg-muted-foreground/20" />
                <div className="h-3 w-2/3 rounded-full bg-primary/35" />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-primary p-4 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Kuis
              </p>
              <p className="mt-4 text-3xl font-black">86%</p>
              <p className="text-xs opacity-80">siap tryout</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 p-4">
            <div>
              <p className="text-sm font-bold">Jalur belajar</p>
              <p className="text-xs text-muted-foreground">
                4 langkah tersusun rapi
              </p>
            </div>
            <div className="flex gap-1.5">
              <span className="size-2 rounded-full bg-primary-light" />
              <span className="size-2 rounded-full bg-primary-light" />
              <span className="size-2 rounded-full bg-primary-light/40" />
              <span className="size-2 rounded-full bg-primary-light/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
