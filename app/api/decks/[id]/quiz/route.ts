import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { QUIZ_MIN_CARDS, generateQuizQuestions } from "@/lib/quiz";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const deck = await prisma.deck.findFirst({
    where: { id, userId: session.sub },
    select: {
      id: true,
      cards: { select: { id: true, front: true, back: true } },
    },
  });

  if (!deck) {
    return Response.json({ error: "Deck tidak ditemukan." }, { status: 404 });
  }

  if (deck.cards.length < QUIZ_MIN_CARDS) {
    return Response.json(
      {
        error: `Butuh minimal ${QUIZ_MIN_CARDS} kartu untuk membuat kuis.`,
      },
      { status: 400 }
    );
  }

  const questions = generateQuizQuestions(deck.cards);
  return Response.json({ questions });
}

type SaveQuizBody = {
  score?: unknown;
  total?: unknown;
};

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  let body: SaveQuizBody;
  try {
    body = (await request.json()) as SaveQuizBody;
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const score = typeof body.score === "number" ? body.score : NaN;
  const total = typeof body.total === "number" ? body.total : NaN;

  if (
    !Number.isInteger(score) ||
    !Number.isInteger(total) ||
    total <= 0 ||
    score < 0 ||
    score > total
  ) {
    return Response.json(
      { error: "Skor tidak valid." },
      { status: 400 }
    );
  }

  const { id } = await params;
  const deck = await prisma.deck.findFirst({
    where: { id, userId: session.sub },
    select: { id: true },
  });
  if (!deck) {
    return Response.json({ error: "Deck tidak ditemukan." }, { status: 404 });
  }

  const quiz = await prisma.quiz.create({
    data: {
      score,
      total,
      deckId: id,
      userId: session.sub,
    },
    select: { id: true, score: true, total: true, createdAt: true },
  });

  return Response.json({ quiz }, { status: 201 });
}
