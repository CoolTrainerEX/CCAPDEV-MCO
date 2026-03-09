import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import pino from "pino";

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);
const logger = pino().child({ operation: "session" });

/**
 * Decrypt JWT into payload object.
 * @param {string} session Session string
 * @returns {Promise<{id: string, admin: true | undefined} | undefined>} Decrypted session
 * @author Justin Ryan Uy
 */
export async function decrypt(session: string = "") {
  try {
    return (
      await jwtVerify(session, encodedKey, {
        algorithms: ["HS256"],
      })
    ).payload as { id: string; admin?: boolean };
  } catch {
    logger.info("Unable to decrypt.");
  }
}

/**
 * Creates a user session.
 * @param {string} id User ID
 * @param {boolean | undefined} admin User admin
 * @author Justin Ryan Uy
 */
export async function createSession(id: string, admin: boolean | undefined) {
  (await cookies()).set(
    "session",
    await new SignJWT({ id, admin })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(encodedKey),
    {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      path: "/",
    },
  );
}
