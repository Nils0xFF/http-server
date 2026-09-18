import { pgTable, timestamp, uuid, text } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const chirps = pgTable('chirps', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  body: text('body').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
});

export type NewChirp = typeof chirps.$inferInsert;
