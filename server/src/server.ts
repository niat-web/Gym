import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initCronJobs, stopCronJobs } from './jobs/index.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start Background Cron Jobs
    initCronJobs();

    // 3. Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 FitCore Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check: http://localhost:${env.PORT}/health`);
      logger.info(`API Base: http://localhost:${env.PORT}/api/v1`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down server...`);
      server.close(async () => {
        stopCronJobs();
        await disconnectDB();
        logger.info('FitCore Server shutdown complete');
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown takes too long
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Fatal error during server startup');
    process.exit(1);
  }
};

startServer();
