import { asc, eq } from 'drizzle-orm';
import { db } from '../db.js';
import { chirps } from '../schemas/chirps.js';

export async function createChirp(body: string, userId: string) {
  const [result] = await db
    .insert(chirps)
    .values({
      body,
      userId,
    })
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getChirps() {
  const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
  return result;
}

export async function getChirpById(chirpId: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
  return result;
}
