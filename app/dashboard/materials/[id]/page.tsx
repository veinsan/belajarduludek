import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, ScrollText, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { materialAccessWhere } from "@/lib/access";
import { MaterialActions } from "@/components/material-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function MaterialDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const material = await prisma.material.findFirst({
    where: { id, ...materialAccessWhere(session.sub) },
    select: {
      id: true,
      title: true,
      content: true,
      summary: true,
      userId: true,
      user: { select: { name: true, role: true } },
    },
  });

  if (!material) notFound();

  const isOwner = material.userId === session.sub;

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-enter-up flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Link
            href="/dashboard/materials"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Kembali ke daftar materi
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">
              Materi
            </p>
            {!isOwner ? (
              <span className="flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                <GraduationCap className="size-3" />
                Dari {material.user.role === "GURU" ? "Guru" : "Admin"}{" "}
                {material.user.name}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            {material.title}
          </h1>
        </div>
        <MaterialActions
          materialId={material.id}
          hasSummary={Boolean(material.summary)}
        />
      </div>

      {material.summary ? (
        <section className="liquid-card animate-enter-up animation-delay-100 relative flex flex-col gap-3 overflow-hidden rounded-[1.25rem] border border-primary-light/25 p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-light/60 to-transparent"
          />
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary-light">
            <Sparkles className="size-4" />
            Ringkasan AI
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed md:text-base">
            {material.summary}
          </p>
        </section>
      ) : null}

      <section className="animate-enter-up animation-delay-200 flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <ScrollText className="size-4" />
          Isi materi
        </h2>
        <p className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 md:text-base">
          {material.content}
        </p>
      </section>
    </div>
  );
}
