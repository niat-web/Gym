import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let memoryServerInstance: any = null;

// Ensure DNS resolution handles SRV records properly for mongodb+srv URIs
if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch {
    // Ignore if setServers is not supported in current environment
  }
}

export const connectDB = async (customUri?: string): Promise<void> => {
  try {
    let mongoUri = customUri || env.MONGODB_URI;

    if (env.NODE_ENV === 'test' && !customUri) {
      mongoUri = 'mongodb://127.0.0.1:27017/fitcore_test';
    }

    mongoose.set('strictQuery', true);

    try {
      if (mongoUri.startsWith('mongodb+srv://')) {
        try {
          dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        } catch {}
      }

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: env.NODE_ENV !== 'production',
      });
      logger.info(`MongoDB connected successfully to ${mongoose.connection.host}`);
    } catch (primaryErr: any) {
      logger.warn(`Primary MongoDB connection attempt failed: ${primaryErr?.message || primaryErr}`);

      // If it failed on DNS / SRV resolution, retry once after explicitly enforcing public DNS servers
      if (
        mongoUri.startsWith('mongodb+srv://') &&
        (primaryErr?.code === 'ECONNREFUSED' || primaryErr?.syscall === 'querySrv' || primaryErr?.message?.includes('querySrv'))
      ) {
        try {
          logger.info('Retrying MongoDB Atlas connection with Google/Cloudflare DNS resolvers...');
          dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
          await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 6000,
            autoIndex: env.NODE_ENV !== 'production',
          });
          logger.info(`MongoDB connected successfully to ${mongoose.connection.host}`);
          return;
        } catch (retryErr: any) {
          logger.warn(`DNS retry failed: ${retryErr?.message || retryErr}`);
        }
      }

      // If direct connection is not accessible, fallback to MongoMemoryServer
      logger.warn('Direct MongoDB connection failed. Initializing in-memory MongoDB instance...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const fallbackUri = memoryServerInstance.getUri();
      await mongoose.connect(fallbackUri, {
        autoIndex: true,
      });
      logger.info(`Fallback in-memory MongoDB connected: ${fallbackUri}`);
    }

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error}`);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`Error disconnecting MongoDB: ${error}`);
  }
};

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
