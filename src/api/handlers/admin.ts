import { RequestHandler, Request, Response } from 'express';
import { deleteAllUsers } from '../../db/queires/index.js';
import { config } from '../../types/config.js';
import { ForbiddenError } from '../../types/errors.js';

export const handlerReset: RequestHandler = (req: Request, res: Response) => {
  if (config.api.platform !== 'dev') {
    throw new ForbiddenError('');
  }

  config.api.fileserverHits = 0;
  deleteAllUsers();

  res.send();
};

export const handlerMetrics: RequestHandler = (req: Request, res: Response) => {
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
