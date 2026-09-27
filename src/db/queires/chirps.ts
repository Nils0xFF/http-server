import { asc, desc, eq } from 'drizzle-orm';
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

export async function deleteChirp(chirpId: string) {
  const [result] = await db.delete(chirps).where(eq(chirps.id, chirpId));
  return result;
}

export async function getChirps(sort: 'asc' | 'desc', authorId?: string) {
  const query = db.select().from(chirps);
  if (authorId) {
    query.where(eq(chirps.userId, authorId));
  }
  const result = await query.orderBy(sort === 'asc' ? asc(chirps.createdAt) : desc(chirps.createdAt));
  return result;
}

export async function getChirpById(chirpId: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
  return result;
}
