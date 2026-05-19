import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const decks = await prisma.deck.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      _count: { select: { cards: true } },
    },
  });

  return Response.json({ decks });
}

type CreateDeckBody = {
  title?: unknown;
  description?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  let body: CreateDeckBody;
  try {
    body = (await request.json()) as CreateDeckBody;
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!title) {
    return Response.json(
      { error: "Judul deck wajib diisi." },
      { status: 400 }
    );
  }
  if (title.length > 120) {
    return Response.json(
      { error: "Judul maksimal 120 karakter." },
      { status: 400 }
    );
  }

  const deck = await prisma.deck.create({
    data: {
      title,
      description: description || null,
      userId: session.sub,
    },
    select: { id: true, title: true, description: true, createdAt: true },
  });

  return Response.json({ deck }, { status: 201 });
}
