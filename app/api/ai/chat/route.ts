import Anthropic from "@anthropic-ai/sdk";

import { getSession } from "@/lib/auth";

type IncomingMessage = { role: unknown; content: unknown };
type ChatBody = { messages?: unknown };
type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: "Riwayat pesan kosong." },
      { status: 400 }
    );
  }

  const messages: ChatMessage[] = [];
  for (const raw of body.messages as IncomingMessage[]) {
    if (
      !raw ||
      typeof raw !== "object" ||
      (raw.role !== "user" && raw.role !== "assistant") ||
      typeof raw.content !== "string" ||
      raw.content.trim().length === 0
    ) {
      return Response.json(
        { error: "Format pesan tidak valid." },
        { status: 400 }
      );
    }
    messages.push({ role: raw.role, content: raw.content });
  }

  let reply: string;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "Kamu adalah asisten belajar yang ramah dan membantu untuk siswa SMA Indonesia. Jawab pertanyaan tentang materi pelajaran dengan jelas, ringkas, dan dalam Bahasa Indonesia. Berikan contoh atau analogi sederhana jika membantu pemahaman.",
      messages,
    });

    reply = response.content
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

  if (!reply) {
    return Response.json(
      { error: "Tidak ada balasan dari AI." },
      { status: 500 }
    );
  }

  return Response.json({ reply });
}
