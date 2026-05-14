import { jwtVerify, SignJWT } from "jose";

export type AppSession = {
  userId: string;
  familyId: string;
  name: string;
  email: string;
};

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET não configurado no .env.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: AppSession) {
  return new SignJWT({
    userId: session.userId,
    familyId: session.familyId,
    name: session.name,
    email: session.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (
      typeof payload.userId !== "string" ||
      typeof payload.familyId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      familyId: payload.familyId,
      name: payload.name,
      email: payload.email,
    } satisfies AppSession;
  } catch {
    return null;
  }
}

export const sessionExpirationSeconds = SESSION_EXPIRATION_SECONDS;