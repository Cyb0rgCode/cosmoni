import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "cosmoni_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string | null {
  return process.env.APP_PASSWORD || null;
}

/** Deterministic session token derived from the app password — no separate secret needed. */
export function sessionToken(): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update("cosmoni-session").digest("hex");
}

export function isValidPassword(password: string): boolean {
  const expected = secret();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
