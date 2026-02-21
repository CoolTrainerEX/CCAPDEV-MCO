import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { pino } from "pino";

type SessionPayload = { id: number; expiresAt: Date };

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);
const logger = pino().child({ operation: "session" });

/**
 * Encrypts payload into JWT.
 * @param {SessionPayload} payload Payload to encrypt
 * @returns {Promise<string>} Session string
 */
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Decrypt JWT into payload object.
 * @param {string} session Session string
 * @returns {Promise<SessionPayload | undefined>} Decrypted object
 */
export async function decrypt(session: string = "") {
  try {
    return (
      await jwtVerify(session, encodedKey, {
        algorithms: ["HS256"],
      })
    ).payload as SessionPayload;
  } catch {
    logger.info("Unable to decrypt.");
  }
}

/**
 * Creates a user session.
 * @param {number} id User ID
 */
export async function createSession(id: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  (await cookies()).set(
    "session",
    await encrypt({
      id,
      expiresAt,
    }),
    {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    },
  );
}

/**
 * Updates the user session.
 */
export async function updateSession() {
  const session = (await cookies()).get("session")?.value;

  if (!session || !(await decrypt(session))) return;

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Deletes the user session.
 */
export async function deleteSession() {
  (await cookies()).delete("session");
}
