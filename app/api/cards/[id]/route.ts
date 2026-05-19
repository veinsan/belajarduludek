import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

type UpdateCardBody = {
  front?: unknown;
  back?: unknown;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  let body: UpdateCardBody;
  try {
    body = (await request.json()) as UpdateCardBody;
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
  const owned = await prisma.flashcard.findFirst({
    where: { id, deck: { userId: session.sub } },
    select: { id: true },
  });
  if (!owned) {
    return Response.json({ error: "Kartu tidak ditemukan." }, { status: 404 });
  }

  const card = await prisma.flashcard.update({
    where: { id },
    data: { front, back },
    select: { id: true, front: true, back: true, createdAt: true },
  });

  return Response.json({ card });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const result = await prisma.flashcard.deleteMany({
    where: { id, deck: { userId: session.sub } },
  });
  if (result.count === 0) {
    return Response.json({ error: "Kartu tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
