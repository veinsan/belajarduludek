import type { Role, Status } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

const ROLES: readonly Role[] = ["SUPERADMIN", "GURU", "MURID"];
const STATUSES: readonly Status[] = ["PENDING", "APPROVED", "REJECTED"];

type PatchBody = {
  role?: unknown;
  status?: unknown;
};

export async function PATCH(request: Request, { params }: RouteContext) {
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

  const { id } = await params;
  if (id === session.sub) {
    return Response.json(
      { error: "Tidak bisa mengubah akun sendiri." },
      { status: 400 }
    );
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const data: { role?: Role; status?: Status } = {};

  if (body.role !== undefined) {
    if (
      typeof body.role !== "string" ||
      !ROLES.includes(body.role as Role)
    ) {
      return Response.json({ error: "Role tidak valid." }, { status: 400 });
    }
    data.role = body.role as Role;
  }

  if (body.status !== undefined) {
    if (
      typeof body.status !== "string" ||
      !STATUSES.includes(body.status as Status)
    ) {
      return Response.json({ error: "Status tidak valid." }, { status: 400 });
    }
    data.status = body.status as Status;
  }

  if (data.role === undefined && data.status === undefined) {
    return Response.json(
      { error: "Tidak ada perubahan yang dikirim." },
      { status: 400 }
    );
  }

  const result = await prisma.user.updateMany({ where: { id }, data });
  if (result.count === 0) {
    return Response.json(
      { error: "Pengguna tidak ditemukan." },
      { status: 404 }
    );
  }

  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
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

  const { id } = await params;
  if (id === session.sub) {
    return Response.json(
      { error: "Tidak bisa menghapus akun sendiri." },
      { status: 400 }
    );
  }

  // Only non-approved accounts can be removed here — they carry no owned
  // data, so the restrict-by-default FKs on Deck/Material/etc. won't trip.
  const result = await prisma.user.deleteMany({
    where: { id, status: { not: "APPROVED" } },
  });
  if (result.count === 0) {
    return Response.json(
      { error: "Hanya akun yang belum aktif yang bisa dihapus." },
      { status: 400 }
    );
  }

  return Response.json({ ok: true });
}
