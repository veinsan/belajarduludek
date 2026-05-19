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
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      cards: {
        orderBy: { createdAt: "asc" },
        select: { id: true, front: true, back: true, createdAt: true },
      },
    },
  });

  if (!deck) {
    return Response.json({ error: "Deck tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ deck });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const result = await prisma.deck.deleteMany({
    where: { id, userId: session.sub },
  });

  if (result.count === 0) {
    return Response.json({ error: "Deck tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
