import { NextFunction, RequestHandler, Request, Response } from 'express';

export const middlewareLogResponses: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode > 299) {
      console.log(`[NON-OK] ${req.method} ${req.path} - Status: ${res.statusCode}`);
    }
  });
  next();
};
