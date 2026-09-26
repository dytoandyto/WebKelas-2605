import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/db";

const COOKIE_NAME = "classhub_session";
const SESSION_EXPIRATION = 7 * 24 * 60 * 60; // 7 days in seconds

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "default_development_secret_do_not_use_in_production_min_32_chars";
  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionUser): Promise<string> {
  const secret = getJwtSecret();
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRATION}s`)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRATION,
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<(SessionUser & { isActive: boolean }) | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
