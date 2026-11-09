import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/index.js';

export const getHealth = (_req: Request, res: Response): void => {
  const dbStatusMap: Record<number, string> = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING',
  };

  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'HEALTHY' : 'DEGRADED',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatusMap[dbState] || 'UNKNOWN',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
};
