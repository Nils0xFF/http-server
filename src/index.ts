import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import { config } from './config.js';
import { BadRequestError, CustomHttpError, ForbiddenError, NotFoundError } from './errrors.js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createUser, deleteAllUsers, getUserById } from './lib/db/queires/users.js';
import { createChirp, getChirpById, getChirps } from './lib/db/queires/chirps.js';

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = config.api.port;

app.use(express.json());

const middlewareLogResponses: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode > 299) {
      console.log(`[NON-OK] ${req.method} ${req.path} - Status: ${res.statusCode}`);
    }
  });
  next();
};

app.use(middlewareLogResponses);

const middlewareMetricsInc = (req: Request, res: Response, next: NextFunction) => {
  if (res.statusCode == 200) {
    config.api.fileserverHits++;
  }
  next();
};

app.use('/app', middlewareMetricsInc, express.static('./src/app'));

const handlerMetrics: RequestHandler = (req: Request, res: Response) => {
  res.set('Content-Type', 'text/html');
  const content = `
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>
  `;

  res.send(content);
};

app.get('/admin/metrics', handlerMetrics);

const handlerReset: RequestHandler = (req: Request, res: Response) => {
  if (config.api.platform !== 'dev') {
    throw new ForbiddenError('');
  }

  config.api.fileserverHits = 0;
  deleteAllUsers();

  res.send();
};

app.post('/admin/reset', handlerReset);

const handlerReadiness: RequestHandler = (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send('OK');
};

app.get('/api/healthz', handlerReadiness);

async function chirpHandler(req: Request, res: Response) {
  type ChirpBody = {
    body?: unknown;
    userId?: unknown;
  };

  const reqBody = req.body as ChirpBody;
  const { body, userId } = reqBody;
  if (typeof body !== 'string' || body.length === 0) {
    throw new BadRequestError('Invalid body.');
  }
  if (body.length > 140) {
    throw new BadRequestError('Chirp is too long. Max length is 140');
  }
  if (typeof userId !== 'string' || body.length == 0) {
    throw new BadRequestError('Invalid userId.');
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new BadRequestError('Invalid userId.');
  }

  const badWords = new Set(['kerfuffle', 'sharbert', 'fornax']);

  const cleanChirp = body
    .split(' ')
    .map((word) => {
      if (badWords.has(word.toLowerCase())) {
        return '****';
      }
      return word;
    })
    .join(' ');

  const chirp = await createChirp(body, user.id);

  if (!chirp) {
    throw new Error('Could not create chirp');
  }

  res.status(201).json(chirp);
}

app.post('/api/chirps', chirpHandler);

app.get('/api/chirps', async (req, res) => {
  const chirps = await getChirps();
  res.json(chirps);
});

app.get('/api/chirps/:id', async (req, res) => {
  const id = req.params.id;

  const chirp = await getChirpById(id);

  if (!chirp) {
    throw new NotFoundError('Chirp not found!');
  }

  res.json(chirp);
});

app.post('/api/users', async (req, res) => {
  type CreateUserBody = {
    email?: unknown;
  };

  const body = req.body as CreateUserBody;
  const email = body.email;
  if (typeof email !== 'string' || email.length === 0) {
    throw new BadRequestError('Invalid email.');
  }

  const user = await createUser({ email });
  console.log(user);

  res.status(201).json(user);
});

function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof CustomHttpError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Something went wrong on our end' });
  }
}

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
