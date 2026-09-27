import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { NewRefreshToken, refreshTokens } from '../schemas/refresh-tokens.js';
import { users } from '../schemas/users.js';

export async function createRefreshToken(token: NewRefreshToken) {
  const [result] = await db.insert(refreshTokens).values(token).onConflictDoNothing().returning();
  return result;
}

export async function getTokenDetails(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token))
    .leftJoin(users, eq(users.id, refreshTokens.userId));
  return result;
}

export async function revokeToken(token: string) {
  const [result] = await db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
    })
    .where(eq(refreshTokens.token, token))
    .returning();
  return result;
}
