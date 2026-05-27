import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BrainCircuit,
  ClipboardCheck,
  FileText,
  NotebookTabs,
  Sparkles,
  Upload,
} from "lucide-react";

import { getSession } from "@/lib/auth";
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
            className="text-lg font-extrabold tracking-tight"
          >
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
            <span className="animate-enter-up rounded-full border border-border-strong bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-light">
              Untuk siswa SMA Indonesia
            </span>
            <h1 className="animate-enter-up animation-delay-100 text-6xl font-black leading-[0.98] tracking-tight md:text-7xl lg:text-[84px]">
              Belajar <span className="text-primary"> Dulu </span> Dek
              <br />
              Biar jadi smart kid
            </h1>
            <p className="animate-enter-up animation-delay-200 max-w-[760px] text-xl leading-relaxed text-muted-foreground md:text-2xl">
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
          <ul className="grid gap-5 md:grid-cols-2">
            {features.map((feature, index) => (
              <Reveal
                key={feature.number}
                as="li"
                delay={index * 90}
              >
                <Card className="group flex min-h-[188px] flex-col justify-center gap-5 rounded-2xl border-border bg-card p-8 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:bg-elevated">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-sm font-semibold text-primary-light">
                      {feature.number}
                    </span>
                    <span className="flex size-10 items-center justify-center rounded-xl border border-border-strong bg-background text-primary-light transition-colors group-hover:border-primary/60 group-hover:text-foreground">
                      <feature.icon className="size-5" aria-hidden />
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="max-w-[560px] text-lg leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" className="pb-24">
          <Card className="relative isolate flex min-h-[176px] overflow-hidden flex-col items-start justify-center gap-6 rounded-2xl border-border bg-card p-10 shadow-none md:flex-row md:items-center md:justify-between md:gap-8 md:p-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-light/50 to-transparent" />
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Udah siap mulai belajar?
              </h2>
              <p className="text-lg text-muted-foreground">
                Gratis dipakai. Tinggal daftar, upload materi, langsung mulai.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Button asChild size="lg" className="h-11 rounded-xl px-5 text-lg">
                <Link href="/register">Daftar sekarang</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-11 px-3 text-lg hover:bg-transparent"
              >
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </Card>
        </Reveal>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1302px] flex-col items-start gap-2 px-5 py-8">
          <p className="text-base font-bold">BelajarDuluDek</p>
          <p className="text-sm text-muted-foreground">
            Ringkasan, flashcard, dan latihan soal dalam satu tempat
          </p>
        </div>
      </footer>
    </div>
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
