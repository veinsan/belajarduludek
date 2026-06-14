import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { materialAccessWhere } from "@/lib/access";
import { MaterialQuizRunner } from "@/components/material-quiz-runner";

type PageProps = { params: Promise<{ id: string }> };

export default async function MaterialQuizPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const material = await prisma.material.findFirst({
    where: { id, ...materialAccessWhere(session.sub) },
    select: { id: true, title: true },
  });

  if (!material) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/dashboard/materials/${material.id}`}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Kembali ke materi
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Kuis: {material.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih jawaban yang paling tepat. Setiap soal hanya bisa dijawab sekali.
        </p>
      </div>
      <MaterialQuizRunner
        materialId={material.id}
        materialTitle={material.title}
      />
    </div>
  );
}
