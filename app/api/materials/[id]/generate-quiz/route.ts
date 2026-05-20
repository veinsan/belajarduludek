import Anthropic from "@anthropic-ai/sdk";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

type GeneratedQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
};
type GeneratedQuiz = { questions: GeneratedQuestion[] };

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const material = await prisma.material.findFirst({
    where: { id, userId: session.sub },
    select: { id: true, content: true, summary: true },
  });
  if (!material) {
    return Response.json(
      { error: "Materi tidak ditemukan." },
      { status: 404 }
    );
  }

  const source = material.summary ?? material.content;

  let generated: GeneratedQuiz;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "Kamu adalah asisten yang membuat kuis pilihan ganda untuk siswa SMA Indonesia. Buat 5 pertanyaan dalam Bahasa Indonesia. Setiap pertanyaan punya 4 pilihan jawaban dan tepat 1 jawaban benar. Pengecoh harus masuk akal namun tetap salah.",
      tools: [
        {
          name: "save_questions",
          description:
            "Simpan 5 pertanyaan pilihan ganda yang dihasilkan dari materi.",
          input_schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: {
                  type: "object",
                  properties: {
                    question: {
                      type: "string",
                      description: "Pertanyaan kuis.",
                    },
                    choices: {
                      type: "array",
                      minItems: 4,
                      maxItems: 4,
                      items: { type: "string" },
                      description: "4 pilihan jawaban.",
                    },
                    correctIndex: {
                      type: "integer",
                      minimum: 0,
                      maximum: 3,
                      description: "Index pilihan yang benar (0-3).",
                    },
                  },
                  required: ["question", "choices", "correctIndex"],
                },
              },
            },
            required: ["questions"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "save_questions" },
      messages: [
        {
          role: "user",
          content: `Buat kuis dari materi berikut:\n\n${source}`,
        },
      ],
    });

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    if (!toolUse) {
      return Response.json(
        { error: "Gagal menghasilkan kuis." },
        { status: 500 }
      );
    }
    generated = toolUse.input as GeneratedQuiz;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: "Gagal memanggil layanan AI." },
        { status: 502 }
      );
    }
    throw error;
  }

  const questions = (generated.questions ?? []).filter(
    (q): q is GeneratedQuestion =>
      q !== null &&
      typeof q === "object" &&
      typeof q.question === "string" &&
      q.question.trim().length > 0 &&
      Array.isArray(q.choices) &&
      q.choices.length === 4 &&
      q.choices.every(
        (c) => typeof c === "string" && c.trim().length > 0
      ) &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex < 4
  );

  if (questions.length === 0) {
    return Response.json(
      { error: "Gagal menghasilkan kuis." },
      { status: 500 }
    );
  }

  return Response.json({ questions });
}
