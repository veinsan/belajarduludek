import Anthropic from "@anthropic-ai/sdk";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { materialAccessWhere } from "@/lib/access";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  // Murid boleh memicu ringkasan AI pada materi guru, bukan hanya miliknya.
  const material = await prisma.material.findFirst({
    where: { id, ...materialAccessWhere(session.sub) },
    select: { id: true, content: true },
  });
  if (!material) {
    return Response.json(
      { error: "Materi tidak ditemukan." },
      { status: 404 }
    );
  }

  let summary: string;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "Kamu adalah asisten yang membantu siswa SMA Indonesia merangkum materi belajar. Buat rangkuman ringkas, jelas, dan mudah dipahami dalam Bahasa Indonesia. Fokus pada poin-poin penting.",
      messages: [
        {
          role: "user",
          content: `Rangkum materi berikut:\n\n${material.content}`,
        },
      ],
    });

    summary = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: "Gagal memanggil layanan AI." },
        { status: 502 }
      );
    }
    throw error;
  }

  if (!summary) {
    return Response.json(
      { error: "Gagal menghasilkan rangkuman." },
      { status: 500 }
    );
  }

  await prisma.material.update({
    where: { id: material.id },
    data: { summary },
  });

  return Response.json({ summary });
}
