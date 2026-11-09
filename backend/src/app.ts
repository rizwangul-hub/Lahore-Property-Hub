import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = (): Application => {
  const app: Application = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration supporting custom domains (with or without www) and localhost
  const allowedOrigins = Array.from(
    new Set([
      config.frontendUrl,
      config.frontendUrl.includes('://www.')
        ? config.frontendUrl.replace('://www.', '://')
        : config.frontendUrl.replace('://', '://www.'),
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      ...(process.env.ADDITIONAL_ALLOWED_ORIGINS
        ? process.env.ADDITIONAL_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
        : []),
    ])
  ).filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not permitted by CORS policy`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
  });
  app.use('/api', limiter);

  // Body & Cookie Parsers
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Root welcome route
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: `${config.appName} is running. Check /api/health for system status.`,
    });
  });

  // API Routes
  app.use('/api', routes);

  // 404 Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};

const app = createApp();
export default app;
