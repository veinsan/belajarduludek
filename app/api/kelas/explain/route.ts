import { getSession } from "@/lib/auth";

type ExplainBody = {
  videoId?: unknown;
  title?: unknown;
};

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

  let body: ExplainBody;
  try {
    body = (await request.json()) as ExplainBody;
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!videoId || !title) {
    return Response.json(
      { error: "videoId dan title wajib diisi." },
      { status: 400 }
    );
  }
  if (title.length > 300) {
    return Response.json(
      { error: "Judul terlalu panjang." },
      { status: 400 }
    );
  }

  const prompt = `Kamu adalah guru SMA yang ramah dan jelas dalam menjelaskan materi pelajaran. Berikan penjelasan singkat untuk siswa SMA Indonesia tentang topik video berikut. Gunakan Bahasa Indonesia yang sederhana.

Judul video: "${title}"

Strukturkan jawabanmu menjadi 3 bagian:
1. Penjelasan singkat tentang topik utama video.
2. Konsep kunci yang harus dipahami siswa.
3. Contoh atau analogi sederhana yang membantu pemahaman.

Maksimal 400 kata. Jangan menyertakan disclaimer; langsung mulai dengan penjelasan.`;

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
        contents: [{ parts: [{ text: prompt }] }],
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

  const explanation = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!explanation) {
    return Response.json(
      { error: "Tidak ada penjelasan dari Gemini." },
      { status: 500 }
    );
  }

  return Response.json({ explanation });
}
