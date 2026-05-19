import { cookies } from "next/headers";
import jwt, { type SignOptions } from "jsonwebtoken";

export const AUTH_COOKIE = "bdd_token";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
};

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

export function signSession(payload: SessionPayload): string {
  const options: SignOptions = { expiresIn: TOKEN_TTL_SECONDS };
  return jwt.sign(payload, getSecret(), options);
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof (decoded as SessionPayload).sub === "string" &&
      typeof (decoded as SessionPayload).email === "string" &&
      typeof (decoded as SessionPayload).name === "string"
    ) {
      const { sub, email, name } = decoded as SessionPayload;
      return { sub, email, name };
    }
    return null;
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
