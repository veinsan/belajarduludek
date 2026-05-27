import type { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ kind: string; id: string }> };

type ContentKind = "classes" | "tryouts" | "books";

type PatchBody = {
  title?: unknown;
  subject?: unknown;
  description?: unknown;
  content?: unknown;
  videoId?: unknown;
  thumbnailUrl?: unknown;
  durationMinutes?: unknown;
  questions?: unknown;
  author?: unknown;
  coverUrl?: unknown;
};

type TryoutQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
};

const PDF_MAX_BYTES = 20 * 1024 * 1024;
const PDF_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "books");
const PDF_PUBLIC_PREFIX = "/uploads/books";

function getKind(kind: string): ContentKind | null {
  if (kind === "classes" || kind === "tryouts" || kind === "books") {
    return kind;
  }
  return null;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  if (session.role !== "SUPERADMIN") {
    return Response.json(
      { error: "Akses ditolak. Khusus admin." },
      { status: 403 }
    );
  }
  return null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown) {
  const cleaned = text(value);
  return cleaned || null;
}

function validateTitle(title: string) {
  if (!title) return "Judul wajib diisi.";
  if (title.length > 140) return "Judul maksimal 140 karakter.";
  return null;
}

function normalizeVideoId(value: unknown) {
  const raw = text(value);
  if (!raw) return null;

  try {
    const url = new URL(raw);
    const fromQuery = url.searchParams.get("v");
    if (fromQuery) return fromQuery.trim();
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.at(-1)?.trim() || raw;
  } catch {
    return raw;
  }
}

function validateUrl(value: string | null, label: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return null;
  } catch {
    return `${label} harus berupa URL valid.`;
  }
  return `${label} harus berupa URL http/https.`;
}

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function safeFileName(name: string) {
  const baseName = name.trim() || "book.pdf";
  const cleaned = baseName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100);
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned}.pdf`;
}

async function savePdfUpload(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  if (value.size > PDF_MAX_BYTES) {
    return { error: "Ukuran PDF maksimal 20 MB." };
  }
  if (
    value.type !== "application/pdf" &&
    !value.name.toLowerCase().endsWith(".pdf")
  ) {
    return { error: "File buku harus berupa PDF." };
  }

  await mkdir(PDF_UPLOAD_DIR, { recursive: true });
  const fileName = `${randomUUID()}-${safeFileName(value.name)}`;
  const targetPath = path.join(PDF_UPLOAD_DIR, fileName);
  await writeFile(targetPath, Buffer.from(await value.arrayBuffer()));

  return {
    pdfUrl: `${PDF_PUBLIC_PREFIX}/${fileName}`,
    pdfFileName: value.name || fileName,
  };
}

async function deletePdfUpload(pdfUrl: string | null) {
  if (!pdfUrl?.startsWith(`${PDF_PUBLIC_PREFIX}/`)) return;
  const fileName = path.basename(pdfUrl);
  await unlink(path.join(PDF_UPLOAD_DIR, fileName)).catch(() => undefined);
}

function normalizeQuestions(value: unknown): TryoutQuestion[] | string {
  if (!Array.isArray(value)) return "Soal tryout wajib berupa array JSON.";

  const questions: TryoutQuestion[] = [];
  for (const [index, raw] of value.entries()) {
    if (typeof raw !== "object" || raw === null) {
      return `Soal nomor ${index + 1} tidak valid.`;
    }
    const item = raw as Record<string, unknown>;
    const question = text(item.question);
    const choices = Array.isArray(item.choices)
      ? item.choices.map(text).filter(Boolean)
      : [];
    const correctIndex =
      typeof item.correctIndex === "number" ? item.correctIndex : -1;
    const explanation = nullableText(item.explanation) ?? undefined;

    if (!question) return `Pertanyaan nomor ${index + 1} wajib diisi.`;
    if (choices.length < 2) {
      return `Pertanyaan nomor ${index + 1} minimal punya 2 pilihan.`;
    }
    if (!Number.isInteger(correctIndex) || correctIndex < 0) {
      return `Jawaban benar nomor ${index + 1} tidak valid.`;
    }
    if (correctIndex >= choices.length) {
      return `Jawaban benar nomor ${index + 1} di luar jumlah pilihan.`;
    }

    questions.push({ question, choices, correctIndex, explanation });
  }

  if (questions.length === 0) return "Tryout minimal punya 1 soal.";
  return questions;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const blocked = await requireAdmin();
  if (blocked) return blocked;

  const { kind: rawKind, id } = await params;
  const kind = getKind(rawKind);
  if (!kind) return Response.json({ error: "Jenis konten tidak valid." }, { status: 400 });

  let body: PatchBody;
  let uploadedPdf: Awaited<ReturnType<typeof savePdfUpload>> = null;
  try {
    if (
      kind === "books" &&
      request.headers.get("content-type")?.includes("multipart/form-data")
    ) {
      const formData = await request.formData();
      uploadedPdf = await savePdfUpload(formData.get("pdf"));
      if (uploadedPdf && "error" in uploadedPdf) {
        return Response.json({ error: uploadedPdf.error }, { status: 400 });
      }
      body = {
        title: formText(formData, "title"),
        author: formText(formData, "author"),
        description: formText(formData, "description"),
        content: formText(formData, "content"),
        coverUrl: formText(formData, "coverUrl"),
      };
    } else {
      body = (await request.json()) as PatchBody;
    }
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const title = text(body.title);
  const titleError = validateTitle(title);
  if (titleError) return Response.json({ error: titleError }, { status: 400 });

  if (kind === "classes") {
    const subject = text(body.subject);
    if (!subject) {
      return Response.json(
        { error: "Mata pelajaran wajib diisi." },
        { status: 400 }
      );
    }
    const thumbnailUrl = nullableText(body.thumbnailUrl);
    const thumbnailError = validateUrl(thumbnailUrl, "Thumbnail");
    if (thumbnailError) {
      return Response.json({ error: thumbnailError }, { status: 400 });
    }
    const result = await prisma.adminClass.updateMany({
      where: { id },
      data: {
        title,
        subject,
        description: nullableText(body.description),
        content: nullableText(body.content),
        videoId: normalizeVideoId(body.videoId),
        thumbnailUrl,
      },
    });
    if (result.count === 0) {
      return Response.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }
    const item = await prisma.adminClass.findUnique({ where: { id } });
    return Response.json({ item });
  }

  if (kind === "tryouts") {
    const questions = normalizeQuestions(body.questions);
    if (typeof questions === "string") {
      return Response.json({ error: questions }, { status: 400 });
    }
    const durationMinutes =
      typeof body.durationMinutes === "number" &&
      Number.isInteger(body.durationMinutes) &&
      body.durationMinutes > 0
        ? body.durationMinutes
        : null;
    const result = await prisma.adminTryout.updateMany({
      where: { id },
      data: {
        title,
        description: nullableText(body.description),
        durationMinutes,
        questions: questions as unknown as Prisma.InputJsonValue,
      },
    });
    if (result.count === 0) {
      return Response.json(
        { error: "Tryout tidak ditemukan." },
        { status: 404 }
      );
    }
    const item = await prisma.adminTryout.findUnique({ where: { id } });
    return Response.json({ item });
  }

  const content = text(body.content);
  const coverUrl = nullableText(body.coverUrl);
  const coverError = validateUrl(coverUrl, "Cover");
  if (coverError) return Response.json({ error: coverError }, { status: 400 });

  const currentBook = await prisma.adminBook.findUnique({
    where: { id },
    select: { id: true, pdfUrl: true },
  });
  if (!currentBook) {
    return Response.json({ error: "Buku tidak ditemukan." }, { status: 404 });
  }
  if (!content && !currentBook.pdfUrl && !uploadedPdf) {
    return Response.json(
      { error: "Isi buku atau file PDF wajib diisi." },
      { status: 400 }
    );
  }

  const data: Prisma.AdminBookUpdateInput = {
      title,
      author: nullableText(body.author),
      description: nullableText(body.description),
      content,
      coverUrl,
  };
  if (uploadedPdf && "pdfUrl" in uploadedPdf) {
    data.pdfUrl = uploadedPdf.pdfUrl;
    data.pdfFileName = uploadedPdf.pdfFileName;
  }

  const item = await prisma.adminBook.update({ where: { id }, data });
  if (uploadedPdf && "pdfUrl" in uploadedPdf) {
    await deletePdfUpload(currentBook.pdfUrl);
  }
  return Response.json({ item });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const blocked = await requireAdmin();
  if (blocked) return blocked;

  const { kind: rawKind, id } = await params;
  const kind = getKind(rawKind);
  if (!kind) return Response.json({ error: "Jenis konten tidak valid." }, { status: 400 });

  if (kind === "classes") {
    const result = await prisma.adminClass.deleteMany({ where: { id } });
    if (result.count === 0) {
      return Response.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }
    return Response.json({ ok: true });
  }

  if (kind === "tryouts") {
    const result = await prisma.adminTryout.deleteMany({ where: { id } });
    if (result.count === 0) {
      return Response.json(
        { error: "Tryout tidak ditemukan." },
        { status: 404 }
      );
    }
    return Response.json({ ok: true });
  }

  const book = await prisma.adminBook.findUnique({
    where: { id },
    select: { pdfUrl: true },
  });
  const result = await prisma.adminBook.deleteMany({ where: { id } });
  if (result.count === 0) {
    return Response.json({ error: "Buku tidak ditemukan." }, { status: 404 });
  }
  await deletePdfUpload(book?.pdfUrl ?? null);
  return Response.json({ ok: true });
}
