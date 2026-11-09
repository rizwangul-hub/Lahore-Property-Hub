import mongoose from 'mongoose';
import { config } from './index.js';

export const connectDatabase = async (): Promise<boolean> => {
  if (!config.mongoUri) {
    console.warn(
      '[Database] ⚠️ MONGODB_URI is not defined in environment variables. Database connection skipped.'
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    });

    console.log(`[Database] ✅ MongoDB connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(
      '[Database] ❌ MongoDB connection error:',
      error instanceof Error ? error.message : error
    );
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] ⚠️ MongoDB connection lost.');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] ❌ MongoDB runtime error:', err);
});

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed.');
  }
};
