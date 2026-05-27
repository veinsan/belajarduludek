import Link from "next/link";
import { notFound } from "next/navigation";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function CustomKelasPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const kelas = await prisma.adminClass.findUnique({
    where: { id },
  });

  if (!kelas) notFound();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <Link
          href="/dashboard/kelas"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Kembali ke Kelas
        </Link>
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {kelas.subject}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {kelas.title}
          </h1>
          {kelas.description ? (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {kelas.description}
            </p>
          ) : null}
        </div>
      </section>

      {kelas.videoId ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${kelas.videoId}`}
              title={kelas.title}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      ) : null}

      {kelas.content ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Catatan kelas
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {kelas.content}
          </p>
        </section>
      ) : null}
    </div>
  );
}
