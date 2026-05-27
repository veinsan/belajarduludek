import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AdminUsers } from "@/components/admin-users";
import { AdminContentManager } from "@/components/admin-content-manager";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPERADMIN") redirect("/dashboard");

  const [users, classes, tryouts, books] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.adminClass.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.adminTryout.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.adminBook.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  const pending = users.filter((u) => u.status === "PENDING");
  const approved = users.filter((u) => u.status === "APPROVED");

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
          Persetujuan Akun
        </h1>
        <p className="text-sm text-muted-foreground">
          Setujui pendaftar baru dan atur peran pengguna.
        </p>
      </header>

      <AdminUsers
        currentUserId={session.sub}
        pending={pending.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
        }))}
        approved={approved.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
        }))}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight">
            Kelola Konten
          </h2>
          <p className="text-sm text-muted-foreground">
            Tambah dan edit kelas, tryout, serta buku untuk semua pengguna.
          </p>
        </div>
        <AdminContentManager
          classes={classes.map((item) => ({
            id: item.id,
            title: item.title,
            subject: item.subject,
            description: item.description,
            content: item.content,
            videoId: item.videoId,
            thumbnailUrl: item.thumbnailUrl,
            updatedAt: item.updatedAt.toISOString(),
          }))}
          tryouts={tryouts.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            durationMinutes: item.durationMinutes,
            questions: item.questions,
            updatedAt: item.updatedAt.toISOString(),
          }))}
          books={books.map((item) => ({
            id: item.id,
            title: item.title,
            author: item.author,
            description: item.description,
            content: item.content,
            coverUrl: item.coverUrl,
            pdfUrl: item.pdfUrl,
            pdfFileName: item.pdfFileName,
            updatedAt: item.updatedAt.toISOString(),
          }))}
        />
      </section>
    </div>
  );
}
