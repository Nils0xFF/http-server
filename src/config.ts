import { MigrationConfig } from 'drizzle-orm/migrator';
import { envOrThrow, envOrThrowNumber } from './lib/utils/env.js';

process.loadEnvFile();

type DBConfig = {
  migrationConfig: MigrationConfig;
  url: string;
};

type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: 'dev' | string;
};

type AppConfig = {
  db: DBConfig;
  api: APIConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: './src/lib/db/migrations',
};

export const config: AppConfig = {
  api: {
    fileserverHits: 0,
    port: envOrThrowNumber('PORT'),
    platform: envOrThrow('PLATFORM'),
  },
  db: {
    url: envOrThrow('DB_URL'),
    migrationConfig,
  },
};
