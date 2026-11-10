import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

export interface AppConfig {
  appName: string;
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  frontendUrl: string;
  mongoUri: string;
  jwtSecret: string;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    adminEmail: string;
  };
}

export const config: AppConfig = {
  appName: 'Property in Lahore API',
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'https://www.propertyinlahore.online',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'lahore-hub-dev-jwt-secret-replace-in-prod',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: 'lahore-property-hub/properties',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300, // Limit each IP to 300 requests per windowMs (prevents accidental 429 during active administration)
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Property in Lahore <noreply@propertyinlahore.online>',
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@propertyinlahore.online',
  },
};

/**
 * Validates critical environment configuration upon application startup.
 */
export const validateEnv = (): void => {
  const missing: string[] = [];

  if (!config.mongoUri) {
    missing.push('MONGODB_URI');
  }

  if (config.nodeEnv === 'production') {
    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'lahore-hub-dev-jwt-secret-replace-in-prod' ||
      process.env.JWT_SECRET.length < 32
    ) {
      missing.push('JWT_SECRET (must be a cryptographically strong secret with >= 32 characters in production)');
    }
    if (!process.env.FRONTEND_URL) {
      missing.push('FRONTEND_URL');
    }
  }

  if (missing.length > 0) {
    const errorMsg = `[Config Validation Error] Missing or invalid configuration variables:\n - ${missing.join(
      '\n - '
    )}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
};

