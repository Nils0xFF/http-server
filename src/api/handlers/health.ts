import { RequestHandler, Request, Response } from 'express';

export const handlerReadiness: RequestHandler = (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send('OK');
};
