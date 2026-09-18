import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schemas/index.js';
import { config } from '../types/config.js';

const conn = postgres(config.db.url);
export const db = drizzle(conn, { schema });
