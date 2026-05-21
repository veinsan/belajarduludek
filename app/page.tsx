import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    number: "01",
    title: "Upload materi",
    description:
      "Simpan catatan, ringkasan kelas, atau bab buku di satu tempat. Akses kapan saja, dari mana saja.",
  },
  {
    number: "02",
    title: "Ringkasan AI",
    description:
      "Tempel materi panjang, biarkan AI menyaring intinya jadi poin-poin yang siap kamu pelajari.",
  },
  {
    number: "03",
    title: "Flashcard otomatis",
    description:
      "AI bantu membuat kartu Q&A dari materimu. Bolak-balik kartu, hafal lebih cepat.",
  },
  {
    number: "04",
    title: "Kuis & tryout",
    description:
      "Uji pemahamanmu lewat kuis pilihan ganda dan tryout gabungan. Streak harianmu kelihatan.",
  },
];

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border bg-sidebar/80">
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
        <section className="flex min-h-[590px] flex-col items-start justify-center gap-7 pt-10 md:max-w-[930px]">
          <span className="rounded-full border border-border-strong bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-light">
            Untuk siswa SMA Indonesia
          </span>
          <h1 className="text-6xl font-black leading-[0.98] tracking-tight md:text-7xl lg:text-[84px]">
            Belajar <span className="text-primary">dulu, dek.</span>
            <br />
            Biar nilainya mengikuti.
          </h1>
          <p className="max-w-[760px] text-xl leading-relaxed text-muted-foreground md:text-2xl">
            BelajarDuluDek mengubah catatan dan materi pelajaranmu jadi
            ringkasan, flashcard, dan kuis interaktif. Satu tempat untuk semua
            persiapan ulangan dan UTBK.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button asChild size="lg" className="h-10 rounded-xl px-4 text-base">
              <Link href="/register">Mulai gratis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-10 rounded-xl border-border bg-background px-4 text-base hover:bg-card"
            >
              <Link href="/login">Sudah punya akun</Link>
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-8 pb-24 pt-5 md:pb-28">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              Yang kamu dapat
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-[42px]">
              Empat alat, satu tempat.
            </h2>
          </div>
          <ul className="grid gap-5 md:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.number}>
                <Card className="flex min-h-[188px] flex-col justify-center gap-5 rounded-2xl border-border bg-card p-8 shadow-none transition-colors hover:border-border-strong hover:bg-elevated">
                  <span className="font-mono text-sm font-semibold text-primary-light">
                    {feature.number}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="max-w-[560px] text-lg leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section className="pb-24">
          <Card className="flex min-h-[176px] flex-col items-start justify-center gap-6 rounded-2xl border-border bg-card p-10 shadow-none md:flex-row md:items-center md:justify-between md:gap-8 md:p-12">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Siap belajar lebih cerdas?
              </h2>
              <p className="text-lg text-muted-foreground">
                Gratis untuk dipakai. Daftar pakai email, langsung mulai.
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
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1302px] flex-col items-start gap-2 px-5 py-8">
          <p className="text-base font-bold">BelajarDuluDek</p>
          <p className="text-sm text-muted-foreground">
            Belajar dulu, dek. Biar nilainya mengikuti.
          </p>
        </div>
      </footer>
    </div>
  );
}
