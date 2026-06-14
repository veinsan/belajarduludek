import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

type RegisterBody = {
  email?: unknown;
  name?: unknown;
  password?: unknown;
  role?: unknown;
};

// Pendaftar hanya boleh meminta peran murid/guru; SUPERADMIN diberikan manual.
const REGISTERABLE_ROLES = ["MURID", "GURU"] as const;
type RegisterableRole = (typeof REGISTERABLE_ROLES)[number];

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return Response.json(
      { error: "Body tidak valid." },
      { status: 400 }
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role: RegisterableRole =
    typeof body.role === "string" &&
    REGISTERABLE_ROLES.includes(body.role as RegisterableRole)
      ? (body.role as RegisterableRole)
      : "MURID";

  if (!email || !name || !password) {
    return Response.json(
      { error: "Email, nama, dan kata sandi wajib diisi." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { error: "Format email tidak valid." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return Response.json(
      { error: "Kata sandi minimal 8 karakter." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json(
      { error: "Email sudah terdaftar." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  // Status mengikuti default skema (PENDING) — akun baru harus
  // disetujui SUPERADMIN dulu sebelum bisa login.
  await prisma.user.create({
    data: { email, name, password: hashed, role },
    select: { id: true },
  });

  return Response.json(
    {
      message:
        "Akun berhasil dibuat! Tunggu persetujuan admin dulu ya, setelah itu kamu bisa masuk.",
    },
    { status: 201 }
  );
}
