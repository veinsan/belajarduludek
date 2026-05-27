import type { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ kind: string }> };

type ContentKind = "classes" | "tryouts" | "books";

type CreateBody = {
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
    return {
      session: null,
      response: Response.json(
        { error: "Tidak terautentikasi." },
        { status: 401 }
      ),
    };
  }
  if (session.role !== "SUPERADMIN") {
    return {
      session,
      response: Response.json(
        { error: "Akses ditolak. Khusus admin." },
        { status: 403 }
      ),
    };
  }
  return { session, response: null };
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
  if (value.type !== "application/pdf" && !value.name.toLowerCase().endsWith(".pdf")) {
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

function normalizeQuestions(value: unknown): TryoutQuestion[] | string {
  if (!Array.isArray(value)) {
    return "Soal tryout wajib berupa array JSON.";
  }

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

export async function GET(_request: Request, { params }: RouteContext) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { kind: rawKind } = await params;
  const kind = getKind(rawKind);
  if (!kind) return Response.json({ error: "Jenis konten tidak valid." }, { status: 400 });

  if (kind === "classes") {
    const classes = await prisma.adminClass.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return Response.json({ items: classes });
  }

  if (kind === "tryouts") {
    const tryouts = await prisma.adminTryout.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return Response.json({ items: tryouts });
  }

  const books = await prisma.adminBook.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return Response.json({ items: books });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { session, response } = await requireAdmin();
  if (response || !session) return response;

  const { kind: rawKind } = await params;
  const kind = getKind(rawKind);
  if (!kind) return Response.json({ error: "Jenis konten tidak valid." }, { status: 400 });

  let body: CreateBody;
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
      body = (await request.json()) as CreateBody;
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
    const videoId = normalizeVideoId(body.videoId);
    const thumbnailUrl = nullableText(body.thumbnailUrl);
    const thumbnailError = validateUrl(thumbnailUrl, "Thumbnail");
    if (thumbnailError) {
      return Response.json({ error: thumbnailError }, { status: 400 });
    }

    const item = await prisma.adminClass.create({
      data: {
        title,
        subject,
        description: nullableText(body.description),
        content: nullableText(body.content),
        videoId,
        thumbnailUrl,
        createdById: session.sub,
      },
    });
    return Response.json({ item }, { status: 201 });
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

    const item = await prisma.adminTryout.create({
      data: {
        title,
        description: nullableText(body.description),
        durationMinutes,
        questions: questions as unknown as Prisma.InputJsonValue,
        createdById: session.sub,
      },
    });
    return Response.json({ item }, { status: 201 });
  }

  const content = text(body.content);
  if (!content && !uploadedPdf) {
    return Response.json(
      { error: "Isi buku atau file PDF wajib diisi." },
      { status: 400 }
    );
  }
  const coverUrl = nullableText(body.coverUrl);
  const coverError = validateUrl(coverUrl, "Cover");
  if (coverError) return Response.json({ error: coverError }, { status: 400 });

  const item = await prisma.adminBook.create({
    data: {
      title,
      author: nullableText(body.author),
      description: nullableText(body.description),
      content,
      coverUrl,
      pdfUrl: uploadedPdf && "pdfUrl" in uploadedPdf ? uploadedPdf.pdfUrl : null,
      pdfFileName:
        uploadedPdf && "pdfFileName" in uploadedPdf
          ? uploadedPdf.pdfFileName
          : null,
      createdById: session.sub,
    },
  });
  return Response.json({ item }, { status: 201 });
}
