import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import { config } from './config.js';
import { BadRequestError, CustomHttpError } from './errrors.js';

const app = express();
const PORT = 8080;

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
    config.fileserverHits++;
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
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>
  `;

  res.send(content);
};

app.get('/admin/metrics', handlerMetrics);

const handlerReset: RequestHandler = (req: Request, res: Response) => {
  config.fileserverHits = 0;
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
  };

  const body = req.body as ChirpBody;
  const content = body.body;
  if (typeof content !== 'string' || content.length === 0) {
    throw new BadRequestError('Invalid body.');
  }
  if (content.length > 140) {
    throw new BadRequestError('Chirp is too long. Max length is 140');
  }

  const badWords = new Set(['kerfuffle', 'sharbert', 'fornax']);

  const cleanChirp = content
    .split(' ')
    .map((word) => {
      if (badWords.has(word.toLowerCase())) {
        return '****';
      }
      return word;
    })
    .join(' ');

  res.json({
    cleanedBody: cleanChirp,
  });
}

app.post('/api/validate_chirp', chirpHandler);

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
