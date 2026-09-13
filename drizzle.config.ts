import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: 'src/lib/db/schemas/*.ts',
  out: 'src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgres://postgres:postgres@localhost:5432/chirpy?sslmode=disable',
  },
});
