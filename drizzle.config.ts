import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: 'src/db/schemas/index.ts',
  out: 'src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgres://postgres:postgres@localhost:5432/chirpy?sslmode=disable',
  },
});
