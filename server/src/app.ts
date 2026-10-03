import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import healthRoutes from './routes/health.routes';
import sessionRoutes from './routes/sessions.routes';
import { notFoundHandler } from './middleware/not-found.middleware';
import { errorHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // Configure CORS strictly for the frontend origin
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) return callback(null, true);
        if (origin === env.CLIENT_URL) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );

  // Parse JSON request bodies
  app.use(express.json());

  // Mount API routes
  app.use('/api/health', healthRoutes);
  app.use('/api/sessions', sessionRoutes);

  // 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Centralized error handling middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
