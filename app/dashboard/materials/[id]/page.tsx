import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { MaterialActions } from "@/components/material-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function MaterialDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const material = await prisma.material.findFirst({
    where: { id, userId: session.sub },
    select: {
      id: true,
      title: true,
      content: true,
      summary: true,
    },
  });

  if (!material) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/dashboard/materials"
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar materi
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {material.title}
          </h1>
        </div>
        <MaterialActions materialId={material.id} />
      </div>

      {material.summary ? (
        <section className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ringkasan
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {material.summary}
          </p>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Isi materi
        </h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {material.content}
        </p>
      </section>
    </div>
  );
}
