import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminTryoutRunner,
  type AdminTryoutQuestion,
} from "@/components/admin-tryout-runner";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

function parseQuestions(value: unknown): AdminTryoutQuestion[] {
  if (!Array.isArray(value)) return [];

  const questions: AdminTryoutQuestion[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const raw = item as Record<string, unknown>;
    const question = typeof raw.question === "string" ? raw.question : "";
    const choices = Array.isArray(raw.choices)
      ? raw.choices.filter((choice): choice is string => typeof choice === "string")
      : [];
    const correctIndex =
      typeof raw.correctIndex === "number" ? raw.correctIndex : -1;
    const explanation =
      typeof raw.explanation === "string" ? raw.explanation : undefined;

    if (!question || choices.length < 2 || correctIndex < 0) continue;
    if (correctIndex >= choices.length) continue;
    questions.push({ question, choices, correctIndex, explanation });
  }
  return questions;
}

export default async function AdminTryoutPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const tryout = await prisma.adminTryout.findUnique({ where: { id } });
  if (!tryout) notFound();

  const questions = parseQuestions(tryout.questions);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <Link
          href="/dashboard/tryout"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Kembali ke Tryout
        </Link>
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Tryout admin
            {tryout.durationMinutes
              ? ` · ${tryout.durationMinutes} menit`
              : ""}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {tryout.title}
          </h1>
          {tryout.description ? (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {tryout.description}
            </p>
          ) : null}
        </div>
      </section>

      <AdminTryoutRunner title={tryout.title} questions={questions} />
    </div>
  );
}
