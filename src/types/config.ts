import { MigrationConfig } from 'drizzle-orm/migrator';
import { envOrThrow, envOrThrowNumber } from '../utils/env.js';

process.loadEnvFile();

type DBConfig = {
  migrationConfig: MigrationConfig;
  url: string;
};

type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: 'dev' | string;
  secret: string;
};

type AppConfig = {
  db: DBConfig;
  api: APIConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: './src/db/migrations',
};

export const config: AppConfig = {
  api: {
    fileserverHits: 0,
    port: envOrThrowNumber('PORT'),
    platform: envOrThrow('PLATFORM'),
    secret: envOrThrow('SECRET'),
  },
  db: {
    url: envOrThrow('DB_URL'),
    migrationConfig,
  },
};
