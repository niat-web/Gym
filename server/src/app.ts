import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env.js';
import { isDbConnected } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

export const createApp = (): Express => {
  const app = express();

  // Behind proxy on Render / Vercel
  app.set('trust proxy', 1);

  // Security and compression middlewares
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in development
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parser with 100kb limit
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // Root route
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'FitCore API',
      version: '1.0.0',
      status: 'operational',
      docs: '/api/v1',
    });
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    const connected = isDbConnected();
    res.status(connected ? 200 : 503).json({
      success: true,
      data: {
        status: 'ok',
        db: connected ? 'connected' : 'disconnected',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Mount API v1 routes
  app.use('/api/v1', apiRouter);

  // 404 & Global Error Handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
