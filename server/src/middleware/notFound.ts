import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/AppError.js';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
};
