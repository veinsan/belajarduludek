import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminBookPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  const book = await prisma.adminBook.findUnique({ where: { id } });
  if (!book) notFound();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-start gap-6">
        {book.coverUrl ? (
          <div className="w-32 overflow-hidden rounded-lg border bg-card sm:w-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverUrl}
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Link
            href="/dashboard/materials"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Kembali ke Materi
          </Link>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Buku admin{book.author ? ` · ${book.author}` : ""}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {book.title}
          </h1>
          {book.description ? (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {book.description}
            </p>
          ) : null}
          {book.pdfUrl ? (
            <Button asChild className="mt-2 w-fit">
              <a href={book.pdfUrl} target="_blank" rel="noreferrer">
                <FileText />
                Buka PDF
              </a>
            </Button>
          ) : null}
        </div>
      </section>

      {book.pdfUrl ? (
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Preview PDF</h2>
              <p className="truncate text-xs text-muted-foreground">
                {book.pdfFileName ?? book.title}
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <a href={book.pdfUrl} target="_blank" rel="noreferrer">
                Buka tab baru
              </a>
            </Button>
          </div>
          <iframe
            src={book.pdfUrl}
            title={`PDF ${book.title}`}
            className="h-[75vh] w-full bg-background"
          />
        </section>
      ) : null}

      {book.content ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Isi buku
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {book.content}
          </p>
        </section>
      ) : null}
    </div>
  );
}
