import { NextFunction, Response, Request } from 'express';
import { CustomHttpError } from '../../types/errors.js';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomHttpError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Something went wrong on our end' });
  }
};
