import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type CreatePathBody = {
  title?: unknown;
  deckIds?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  let body: CreatePathBody;
  try {
    body = (await request.json()) as CreatePathBody;
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return Response.json(
      { error: "Judul jalur wajib diisi." },
      { status: 400 }
    );
  }
  if (title.length > 120) {
    return Response.json(
      { error: "Judul maksimal 120 karakter." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.deckIds)) {
    return Response.json(
      { error: "Pilih minimal satu deck." },
      { status: 400 }
    );
  }
  const deckIds = body.deckIds.filter(
    (d): d is string => typeof d === "string" && d.length > 0
  );
  if (deckIds.length === 0) {
    return Response.json(
      { error: "Pilih minimal satu deck." },
      { status: 400 }
    );
  }
  if (new Set(deckIds).size !== deckIds.length) {
    return Response.json(
      { error: "Deck tidak boleh dipilih lebih dari sekali." },
      { status: 400 }
    );
  }

  const ownedDecks = await prisma.deck.findMany({
    where: { id: { in: deckIds }, userId: session.sub },
    select: { id: true },
  });
  if (ownedDecks.length !== deckIds.length) {
    return Response.json(
      { error: "Ada deck yang tidak ditemukan." },
      { status: 400 }
    );
  }

  const path = await prisma.$transaction(async (tx) => {
    const created = await tx.learningPath.create({
      data: { title, userId: session.sub },
      select: { id: true, title: true, createdAt: true },
    });
    await tx.pathStep.createMany({
      data: deckIds.map((deckId, order) => ({
        order,
        pathId: created.id,
        deckId,
      })),
    });
    return created;
  });

  return Response.json({ path }, { status: 201 });
}
