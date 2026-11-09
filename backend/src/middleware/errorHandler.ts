import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (config.nodeEnv === 'development') {
    console.error(`[Error] ${statusCode} - ${message}`, err.stack);
  } else {
    console.error(`[Error] ${statusCode} - ${message}`);
  }

  // Prevent internal database or server implementation details from leaking in production
  const clientMessage =
    config.nodeEnv === 'production' && statusCode >= 500
      ? 'An internal error occurred. Please contact support or try again later.'
      : message;

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};
