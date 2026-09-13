import { db } from '../db.js';
import { NewUser, users } from '../schemas/users.js';

export async function createUser(user: NewUser) {
  const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
  return result;
}
