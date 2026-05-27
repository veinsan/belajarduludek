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

export type CopilotQuizQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type CopilotPayload = {
  reply: string;
  quiz: CopilotQuizQuestion[];
  recommendations: string[];
  sources: string[];
  suggestions: string[];
};

const SYSTEM_INSTRUCTION = `Kamu adalah "Copilot", asisten belajar di aplikasi BelajarDuluDek untuk siswa SMA Indonesia. Selalu jawab dalam Bahasa Indonesia yang ramah dan santai (boleh menyapa dengan "kamu").

Kamu HARUS membalas dalam format JSON sesuai skema, dengan field:
- reply: teks balasan utama. Kalau kamu membuat kuis, isi reply dengan kalimat pengantar singkat (misal "Coba kerjakan soal berikut ya! 👇"). Kalau menjawab pertanyaan biasa, isi reply dengan penjelasan yang jelas (boleh beberapa paragraf).
- quiz: array soal pilihan ganda. ISI HANYA kalau user minta latihan soal / kuis / "buatkan soal". Buat tepat 3 soal; tiap soal punya 4 pilihan (choices), correctIndex (0-3) menunjuk jawaban benar, dan explanation singkat kenapa itu benar. Kalau tidak relevan, kembalikan array kosong.
- recommendations: maksimal 3 judul topik belajar terkait untuk ditampilkan sebagai kartu rekomendasi. Kosongkan kalau tidak ada.
- sources: maksimal 5 judul sumber/referensi yang relevan (seperti judul video atau materi latihan). Kosongkan kalau tidak ada.
- suggestions: 2-3 pertanyaan lanjutan singkat yang mungkin ingin ditanyakan user. Usahakan selalu mengisi minimal 2.

Jangan menulis apa pun di luar JSON.`;

const responseSchema = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING" },
    quiz: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          choices: { type: "ARRAY", items: { type: "STRING" } },
          correctIndex: { type: "INTEGER" },
          explanation: { type: "STRING" },
        },
        required: ["question", "choices", "correctIndex", "explanation"],
      },
    },
    recommendations: { type: "ARRAY", items: { type: "STRING" } },
    sources: { type: "ARRAY", items: { type: "STRING" } },
    suggestions: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["reply", "quiz", "recommendations", "sources", "suggestions"],
} as const;

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .slice(0, max);
}

function normalize(text: string): CopilotPayload {
  const fallback: CopilotPayload = {
    reply: text,
    quiz: [],
    recommendations: [],
    sources: [],
    suggestions: [],
  };

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return fallback;
  }
  if (!parsed || typeof parsed !== "object") return fallback;

  const obj = parsed as Record<string, unknown>;
  const reply =
    typeof obj.reply === "string" && obj.reply.trim().length > 0
      ? obj.reply.trim()
      : "Maaf, aku belum punya jawaban untuk itu.";

  const quiz: CopilotQuizQuestion[] = [];
  if (Array.isArray(obj.quiz)) {
    for (const raw of obj.quiz) {
      if (!raw || typeof raw !== "object") continue;
      const q = raw as Record<string, unknown>;
      const question = typeof q.question === "string" ? q.question.trim() : "";
      const choices = asStringArray(q.choices, 4);
      const explanation =
        typeof q.explanation === "string" ? q.explanation.trim() : "";
      const correctRaw =
        typeof q.correctIndex === "number" ? q.correctIndex : 0;
      if (!question || choices.length < 2) continue;
      const correctIndex = Math.min(
        Math.max(Math.trunc(correctRaw), 0),
        choices.length - 1
      );
      quiz.push({ question, choices, correctIndex, explanation });
      if (quiz.length >= 5) break;
    }
  }

  return {
    reply,
    quiz,
    recommendations: asStringArray(obj.recommendations, 3),
    sources: asStringArray(obj.sources, 5),
    suggestions: asStringArray(obj.suggestions, 3),
  };
}

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
    return Response.json({ error: "Riwayat pesan kosong." }, { status: 400 });
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
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
          responseSchema,
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

  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    return Response.json(
      { error: "Tidak ada balasan dari Gemini." },
      { status: 500 }
    );
  }

  return Response.json(normalize(text));
}
