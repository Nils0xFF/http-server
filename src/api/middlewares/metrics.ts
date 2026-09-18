import { NextFunction, Request, Response } from 'express';
import { config } from '../../types/config.js';

export const middlewareMetricsInc = (req: Request, res: Response, next: NextFunction) => {
  if (res.statusCode == 200) {
    config.api.fileserverHits++;
  }
  next();
};
