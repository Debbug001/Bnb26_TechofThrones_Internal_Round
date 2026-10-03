import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isProd = env.NODE_ENV === 'production';

  if (!isProd) {
    console.error(`[Roundtable Backend Error] ${req.method} ${req.path}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
