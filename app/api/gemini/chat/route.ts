import { getSession } from "@/lib/auth";

type IncomingMessage = { role: unknown; content: unknown };
type ChatBody = { messages?: unknown };
type ChatMessage = { role: "user" | "assistant"; content: string };

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY belum dikonfigurasi." },
      { status: 500 }
    );
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

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  );
  url.searchParams.set("key", apiKey);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "Kamu adalah asisten belajar yang ramah dan membantu untuk siswa SMA Indonesia. Jawab pertanyaan tentang materi pelajaran dengan jelas, ringkas, dan dalam Bahasa Indonesia. Berikan contoh atau analogi sederhana jika membantu pemahaman.",
            },
          ],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { error: "Tidak dapat menghubungi Gemini." },
      { status: 502 }
    );
  }

  const data = (await upstream.json()) as GeminiResponse;

  if (!upstream.ok) {
    return Response.json(
      { error: data.error?.message ?? "Permintaan Gemini gagal." },
      { status: upstream.status }
    );
  }

  const reply = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!reply) {
    return Response.json(
      { error: "Tidak ada balasan dari Gemini." },
      { status: 500 }
    );
  }

  return Response.json({ reply });
}
