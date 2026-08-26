import crypto from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE = "aw_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set to at least 16 characters in production");
    }
    return "dev-only-insecure-session-secret";
  }
  return value;
}

/**
 * Stateless signed session: `<userId>.<expiry>.<hmac>`. Enough for this app,
 * and swappable for a real session store without touching call sites.
 */
function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function createToken(userId: string) {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, signature] = parts;
  const expected = sign(`${userId}.${expires}`);
  // Constant-time compare; lengths must match first or timingSafeEqual throws.
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  if (Number(expires) < Date.now()) return null;
  return userId;
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function startSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, createToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  locale: string;
  planId: string | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const userId = verifyToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      address: true,
      city: true,
      zip: true,
      locale: true,
      planId: true,
    },
  });
  return user;
}

/** Throws-free guard for API routes that must be signed in. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: "UNAUTHENTICATED" as const };
  return { user, error: null };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: "UNAUTHENTICATED" as const };
  if (user.role !== "ADMIN") return { user: null, error: "FORBIDDEN" as const };
  return { user, error: null };
}
