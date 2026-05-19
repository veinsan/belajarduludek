import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE, authCookieOptions, signSession } from "@/lib/auth";

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
  const user = await prisma.user.create({
    data: { email, name, password: hashed },
    select: { id: true, email: true, name: true },
  });

  const token = signSession({ sub: user.id, email: user.email, name: user.name });
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, authCookieOptions());

  return Response.json(
    { user: { id: user.id, email: user.email, name: user.name } },
    { status: 201 }
  );
}
