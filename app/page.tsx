import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Upload materi",
    description:
      "Simpan catatan pelajaranmu di satu tempat dan akses kapan saja.",
  },
  {
    title: "Ringkasan AI",
    description:
      "Biar AI yang merangkum materi panjang jadi poin-poin penting.",
  },
  {
    title: "Flashcard",
    description:
      "Buat kartu Q&A sendiri atau biarkan AI yang menggenerate dari materimu.",
  },
  {
    title: "Kuis",
    description:
      "Uji pemahamanmu lewat kuis pilihan ganda dan pantau streak belajarmu.",
  },
];

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight"
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <section className="flex flex-col items-start gap-4 sm:max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Belajar dulu, dek. Biar nilainya mengikuti.
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            BelajarDuluDek bantu siswa SMA Indonesia mengubah materi pelajaran
            jadi ringkasan, flashcard, dan kuis interaktif — semua dalam satu
            tempat.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button asChild size="lg">
              <Link href="/register">Mulai gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sudah punya akun</Link>
            </Button>
          </div>
        </section>

        <section className="mt-12 flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Fitur utama
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <li key={feature.title}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
