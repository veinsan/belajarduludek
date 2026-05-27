import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

type RegisterBody = {
  email?: unknown;
  name?: unknown;
  password?: unknown;
};

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
  await prisma.user.create({
    data: { email, name, password: hashed, status: "APPROVED" },
    select: { id: true },
  });

  return Response.json(
    { message: "Akun berhasil dibuat. Silakan login." },
    { status: 201 }
  );
}
