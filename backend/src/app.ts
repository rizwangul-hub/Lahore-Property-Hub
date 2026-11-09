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

  // CORS Configuration supporting custom domains (with or without www), vercel, and localhost
  const allowedOrigins = Array.from(
    new Set([
      'https://www.propertyinlahore.online',
      'https://propertyinlahore.online',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      config.frontendUrl,
      config.frontendUrl.includes('://www.')
        ? config.frontendUrl.replace('://www.', '://')
        : config.frontendUrl.replace('://', '://www.'),
      ...(process.env.ADDITIONAL_ALLOWED_ORIGINS
        ? process.env.ADDITIONAL_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
        : []),
    ])
  ).filter(Boolean);

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const isListed = allowedOrigins.includes(origin);
      const isDomainMatch =
        /^https?:\/\/(www\.)?propertyinlahore\.online(:\d+)?$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin);

      if (isListed || isDomainMatch) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Origin rejected: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

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
