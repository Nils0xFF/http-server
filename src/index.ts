import express from 'express';
import { config } from './types/config.js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { errorMiddleware, middlewareLogResponses } from './api/middlewares/index.js';
import { createChirpHandler, getChirpHandler, getChirpsHandler } from './api/handlers/chirps.js';
import { handlerMetrics, handlerReset } from './api/handlers/admin.js';
import { handlerReadiness } from './api/handlers/health.js';
import { middlewareMetricsInc } from './api/middlewares/metrics.js';
import { createUserHandler, loginHandler } from './api/handlers/users.js';

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = config.api.port;

app.use(express.json());

app.use(middlewareLogResponses);

app.use('/app', middlewareMetricsInc, express.static('./src/app'));

app.get('/admin/metrics', handlerMetrics);

app.post('/admin/reset', handlerReset);

app.get('/api/healthz', handlerReadiness);

app.post('/api/chirps', createChirpHandler);
app.get('/api/chirps', getChirpsHandler);
app.get('/api/chirps/:id', getChirpHandler);

app.post('/api/users', createUserHandler);
app.post('/api/login', loginHandler);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
