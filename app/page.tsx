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
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border bg-sidebar">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link
            href="/"
            className="text-base font-extrabold tracking-tight"
          >
            BelajarDuluDek
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Daftar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 md:px-8 md:py-20">
        <section className="flex flex-col items-start gap-6 sm:max-w-3xl">
          <span className="rounded-full border border-border-strong bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-light">
            Untuk siswa SMA Indonesia
          </span>
          <h1 className="text-5xl font-black tracking-tight md:text-6xl lg:text-7xl">
            Belajar <span className="text-primary">dulu, dek.</span>
            <br />
            Biar nilainya mengikuti.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            BelajarDuluDek mengubah catatan dan materi pelajaranmu jadi
            ringkasan, flashcard, dan kuis interaktif. Satu tempat untuk semua
            persiapan ulangan dan UTBK.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/register">Mulai gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sudah punya akun</Link>
            </Button>
          </div>
        </section>

        <section className="mt-20 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Yang kamu dapat
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Empat alat, satu tempat.
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.number}>
                <Card className="flex h-full flex-col gap-3 p-6 transition-colors hover:border-border-strong hover:bg-elevated">
                  <span className="font-mono text-xs font-semibold text-primary-light">
                    {feature.number}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20">
          <Card className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between md:gap-8 md:p-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                Siap belajar lebih cerdas?
              </h2>
              <p className="text-sm text-muted-foreground">
                Gratis untuk dipakai. Daftar pakai email, langsung mulai.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/register">Daftar sekarang</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-1 px-4 py-6 md:px-8">
          <p className="text-sm font-bold">BelajarDuluDek</p>
          <p className="text-xs text-muted-foreground">
            Belajar dulu, dek. Biar nilainya mengikuti.
          </p>
        </div>
      </footer>
    </div>
  );
}
