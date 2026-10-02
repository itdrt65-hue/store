import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { adminAccount } from "./db/schema";

export const MIN_PASSWORD_LENGTH = 8;

export type AdminCredentials = { username: string; passwordHash: string };

// The database login wins; the env vars are only a fallback for fresh deploys.
export async function getAdminCredentials(): Promise<AdminCredentials | null> {
  const [row] = await db.select().from(adminAccount).where(eq(adminAccount.id, 1));
  if (row) return { username: row.username, passwordHash: row.passwordHash };

  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash) return null;
  return { username: process.env.ADMIN_USERNAME ?? "admin", passwordHash };
}

export async function setAdminCredentials(username: string, password: string) {
  const passwordHash = bcrypt.hashSync(password, 10);
  await db
    .insert(adminAccount)
    .values({ id: 1, username, passwordHash })
    .onConflictDoUpdate({
      target: adminAccount.id,
      set: { username, passwordHash, updatedAt: new Date().toISOString() },
    });
}

// Returns an error message, or null when the new login is acceptable.
export function validateNewLogin(username: string, password: string, confirm: string): string | null {
  if (!username) return "Username is required.";
  if (username.length > 64) return "Username is too long.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

// Tiny in-memory throttle for password guessing: `max` failures per window per key.
const failures = new Map<string, { count: number; resetAt: number }>();

export function isThrottled(key: string, max = 10, windowMs = 15 * 60 * 1000): boolean {
  const entry = failures.get(key);
  if (!entry || entry.resetAt < Date.now()) return false;
  return entry.count >= max;
}

export function recordFailure(key: string, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = failures.get(key);
  if (!entry || entry.resetAt < now) {
    failures.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    entry.count += 1;
  }
}

export function clearFailures(key: string) {
  failures.delete(key);
}
