import { envOrThrow } from './lib/utils/env.js';

process.loadEnvFile();

type APIConfig = {
  fileserverHits: number;
  dbURL: string;
};

export const config: APIConfig = {
  fileserverHits: 0,
  dbURL: envOrThrow('DB_URL'),
};
