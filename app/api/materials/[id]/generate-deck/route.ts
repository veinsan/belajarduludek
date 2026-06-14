import Anthropic from "@anthropic-ai/sdk";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { materialAccessWhere } from "@/lib/access";

type RouteContext = { params: Promise<{ id: string }> };

type GeneratedCard = { front: string; back: string };
type GeneratedCards = { cards: GeneratedCard[] };

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  // Deck hasil generate jadi milik user yang meminta, materi cukup bisa diakses.
  const material = await prisma.material.findFirst({
    where: { id, ...materialAccessWhere(session.sub) },
    select: { id: true, title: true, content: true, summary: true },
  });
  if (!material) {
    return Response.json(
      { error: "Materi tidak ditemukan." },
      { status: 404 }
    );
  }

  const source = material.summary ?? material.content;

  let generated: GeneratedCards;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "Kamu adalah asisten yang membuat flashcard Q&A untuk siswa SMA Indonesia. Buat 5-10 pasangan pertanyaan dan jawaban dalam Bahasa Indonesia berdasarkan materi yang diberikan. Pertanyaan harus jelas dan fokus pada konsep penting; jawaban harus ringkas namun lengkap.",
      tools: [
        {
          name: "save_flashcards",
          description: "Simpan 5-10 flashcard yang dihasilkan dari materi.",
          input_schema: {
            type: "object",
            properties: {
              cards: {
                type: "array",
                minItems: 5,
                maxItems: 10,
                items: {
                  type: "object",
                  properties: {
                    front: {
                      type: "string",
                      description: "Pertanyaan (depan kartu).",
                    },
                    back: {
                      type: "string",
                      description: "Jawaban (belakang kartu).",
                    },
                  },
                  required: ["front", "back"],
                },
              },
            },
            required: ["cards"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "save_flashcards" },
      messages: [
        {
          role: "user",
          content: `Buat flashcard dari materi berikut:\n\n${source}`,
        },
      ],
    });

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    if (!toolUse) {
      return Response.json(
        { error: "Gagal menghasilkan flashcard." },
        { status: 500 }
      );
    }
    generated = toolUse.input as GeneratedCards;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: "Gagal memanggil layanan AI." },
        { status: 502 }
      );
    }
    throw error;
  }

  const cards = (generated.cards ?? [])
    .filter(
      (c): c is GeneratedCard =>
        c !== null &&
        typeof c === "object" &&
        typeof c.front === "string" &&
        typeof c.back === "string" &&
        c.front.trim().length > 0 &&
        c.back.trim().length > 0
    )
    .map((c) => ({ front: c.front.trim(), back: c.back.trim() }));

  if (cards.length === 0) {
    return Response.json(
      { error: "Gagal menghasilkan flashcard." },
      { status: 500 }
    );
  }

  const deck = await prisma.$transaction(async (tx) => {
    const created = await tx.deck.create({
      data: {
        title: material.title,
        description: `Dihasilkan dari materi "${material.title}".`,
        userId: session.sub,
      },
      select: { id: true },
    });
    await tx.flashcard.createMany({
      data: cards.map((c) => ({
        front: c.front,
        back: c.back,
        deckId: created.id,
      })),
    });
    return created;
  });

  return Response.json({ deckId: deck.id }, { status: 201 });
}
