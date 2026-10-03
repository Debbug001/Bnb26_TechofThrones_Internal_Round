import express from 'express';
import cors from 'cors';
import { env, allowedOrigins } from './config/env';
import healthRoutes from './routes/health.routes';
import sessionRoutes from './routes/sessions.routes';
import { notFoundHandler } from './middleware/not-found.middleware';
import { errorHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // CORS:
  //  - development: allow any origin (phones on LAN, tunnels). We use no cookies, so this is low risk.
  //  - production: allow only the origins listed in CLIENT_URL (comma separated).
  // A blocked origin simply gets no CORS headers (browser blocks it) instead of a 500 error.
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // curl, Postman, server-to-server
        if (env.NODE_ENV !== 'production') return callback(null, true);
        return callback(null, allowedOrigins.includes(origin.replace(/\/$/, '')));
      },
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
