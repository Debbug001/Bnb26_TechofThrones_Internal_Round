import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`-----------------------------------------------------`);
  console.log(`[Roundtable Backend] Server started successfully`);
  console.log(`[Roundtable Backend] Listening on: http://localhost:${env.PORT}`);
  console.log(`[Roundtable Backend] Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`[Roundtable Backend] CORS: ${env.NODE_ENV === 'production' ? env.CLIENT_URL : 'any origin (development)'}`);
  console.log(`[Roundtable Backend] Environment: ${env.NODE_ENV}`);
  console.log(`-----------------------------------------------------`);
});

// Graceful shutdown handling
const handleShutdown = (signal: string) => {
  console.log(`\n[Roundtable Backend] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Roundtable Backend] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
