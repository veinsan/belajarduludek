import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE, authCookieOptions, signSession } from "@/lib/auth";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return Response.json(
      { error: "Body tidak valid." },
      { status: 400 }
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json(
      { error: "Email dan kata sandi wajib diisi." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json(
      { error: "Email atau kata sandi salah." },
      { status: 401 }
    );
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return Response.json(
      { error: "Email atau kata sandi salah." },
      { status: 401 }
    );
  }

  const token = signSession({ sub: user.id, email: user.email, name: user.name });
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, authCookieOptions());

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}
