import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { NewUser, users } from '../schemas/users.js';

export async function createUser(user: NewUser) {
  const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
  return result;
}

export async function getUserById(userId: string) {
  const [result] = await db.select().from(users).where(eq(users.id, userId));
  return result;
}

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}
