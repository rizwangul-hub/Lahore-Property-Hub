import app from './app.js';
import { config, validateEnv } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { startMarketingScheduler, stopMarketingScheduler } from './services/marketingScheduler.js';

const startServer = async (): Promise<void> => {
  // 1. Validate environment configuration
  validateEnv();

  // 2. Connect to MongoDB Atlas
  await connectDatabase();

  // 3. Start automated campaign scheduler
  startMarketingScheduler();

  const server = app.listen(config.port, () => {
    console.log(
      `🚀 ${config.appName} is running on port ${config.port} in [${config.nodeEnv}] mode`
    );
    console.log(`📡 Health check available at: http://localhost:${config.port}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    stopMarketingScheduler();
    server.close(async () => {
      await disconnectDatabase();
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Force shutdown if taking too long
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
