import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { deckAccessWhere } from "@/lib/access";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "flashcards"
);
const IMAGE_PUBLIC_PREFIX = "/uploads/flashcards";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function saveImageUpload(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  if (value.size > IMAGE_MAX_BYTES) {
    return { error: "Ukuran gambar maksimal 5 MB." };
  }
  const extension = IMAGE_EXTENSIONS[value.type];
  if (!extension) {
    return { error: "Gambar harus berformat JPEG, PNG, WebP, atau GIF." };
  }

  await mkdir(IMAGE_UPLOAD_DIR, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(
    path.join(IMAGE_UPLOAD_DIR, fileName),
    Buffer.from(await value.arrayBuffer())
  );

  return { imageUrl: `${IMAGE_PUBLIC_PREFIX}/${fileName}` };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const deck = await prisma.deck.findFirst({
    where: { id, ...deckAccessWhere(session.sub) },
    select: { id: true },
  });
  if (!deck) {
    return Response.json({ error: "Deck tidak ditemukan." }, { status: 404 });
  }

  const cards = await prisma.flashcard.findMany({
    where: { deckId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, front: true, back: true, imageUrl: true, createdAt: true },
  });

  return Response.json({ cards });
}

type CreateCardBody = {
  front?: unknown;
  back?: unknown;
};

function validateCardText(front: string, back: string): string | null {
  if (!front || !back) return "Pertanyaan dan jawaban wajib diisi.";
  if (front.length > 500) return "Pertanyaan maksimal 500 karakter.";
  if (back.length > 2000) return "Jawaban maksimal 2000 karakter.";
  return null;
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  let front = "";
  let back = "";
  let imageUrl: string | null = null;

  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const rawFront = formData.get("front");
      const rawBack = formData.get("back");
      front = typeof rawFront === "string" ? rawFront.trim() : "";
      back = typeof rawBack === "string" ? rawBack.trim() : "";

      const uploaded = await saveImageUpload(formData.get("image"));
      if (uploaded && "error" in uploaded) {
        return Response.json({ error: uploaded.error }, { status: 400 });
      }
      imageUrl = uploaded?.imageUrl ?? null;
    } else {
      const body = (await request.json()) as CreateCardBody;
      front = typeof body.front === "string" ? body.front.trim() : "";
      back = typeof body.back === "string" ? body.back.trim() : "";
    }
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const textError = validateCardText(front, back);
  if (textError) {
    return Response.json({ error: textError }, { status: 400 });
  }

  const { id } = await params;
  // Menambah kartu tetap khusus pemilik deck.
  const deck = await prisma.deck.findFirst({
    where: { id, userId: session.sub },
    select: { id: true },
  });
  if (!deck) {
    return Response.json({ error: "Deck tidak ditemukan." }, { status: 404 });
  }

  const card = await prisma.flashcard.create({
    data: { front, back, imageUrl, deckId: id },
    select: { id: true, front: true, back: true, imageUrl: true, createdAt: true },
  });

  return Response.json({ card }, { status: 201 });
}
