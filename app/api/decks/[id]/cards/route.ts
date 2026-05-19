import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const deck = await prisma.deck.findFirst({
    where: { id, userId: session.sub },
    select: { id: true },
  });
  if (!deck) {
    return Response.json({ error: "Deck tidak ditemukan." }, { status: 404 });
  }

  const cards = await prisma.flashcard.findMany({
    where: { deckId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, front: true, back: true, createdAt: true },
  });

  return Response.json({ cards });
}

type CreateCardBody = {
  front?: unknown;
  back?: unknown;
};

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  let body: CreateCardBody;
  try {
    body = (await request.json()) as CreateCardBody;
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const front = typeof body.front === "string" ? body.front.trim() : "";
  const back = typeof body.back === "string" ? body.back.trim() : "";

  if (!front || !back) {
    return Response.json(
      { error: "Pertanyaan dan jawaban wajib diisi." },
      { status: 400 }
    );
  }
  if (front.length > 500) {
    return Response.json(
      { error: "Pertanyaan maksimal 500 karakter." },
      { status: 400 }
    );
  }
  if (back.length > 2000) {
    return Response.json(
      { error: "Jawaban maksimal 2000 karakter." },
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

  const card = await prisma.flashcard.create({
    data: { front, back, deckId: id },
    select: { id: true, front: true, back: true, createdAt: true },
  });

  return Response.json({ card }, { status: 201 });
}
