import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type CreateMaterialBody = {
  title?: unknown;
  content?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  let body: CreateMaterialBody;
  try {
    body = (await request.json()) as CreateMaterialBody;
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!title) {
    return Response.json(
      { error: "Judul materi wajib diisi." },
      { status: 400 }
    );
  }
  if (title.length > 120) {
    return Response.json(
      { error: "Judul maksimal 120 karakter." },
      { status: 400 }
    );
  }
  if (!content) {
    return Response.json(
      { error: "Isi materi wajib diisi." },
      { status: 400 }
    );
  }

  const material = await prisma.material.create({
    data: {
      title,
      content,
      userId: session.sub,
    },
    select: { id: true, title: true, createdAt: true },
  });

  return Response.json({ material }, { status: 201 });
}
