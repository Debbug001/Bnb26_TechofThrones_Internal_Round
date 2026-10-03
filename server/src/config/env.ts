import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file if present
dotenv.config();

// Determine effective port: prioritize BACKEND_PORT or PORT, defaulting to 5000
const rawPort = process.env.BACKEND_PORT || process.env.PORT || '5000';
const effectivePort = rawPort === '8080' && !process.env.BACKEND_PORT ? '5000' : rawPort;

const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0) {
        throw new Error('PORT must be a valid positive integer');
      }
      return parsed;
    }),
  // One URL, or several separated by commas (e.g. "http://localhost:3000,https://abc.trycloudflare.com")
  CLIENT_URL: z.string().default('http://localhost:3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  // Supabase PostgreSQL Credentials
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  // LiveKit Real-Time Audio Credentials
  LIVEKIT_URL: z.string().optional().default(''),
  LIVEKIT_API_KEY: z.string().optional().default(''),
  LIVEKIT_API_SECRET: z.string().optional().default(''),
});

const parsedEnv = envSchema.safeParse({
  ...process.env,
  PORT: effectivePort,
});

if (!parsedEnv.success) {
  console.error('[Roundtable Backend] Invalid environment configuration:');
  parsedEnv.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : {
      PORT: 5000,
      CLIENT_URL: 'http://localhost:3000',
      NODE_ENV: 'development' as const,
      SUPABASE_URL: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
      LIVEKIT_URL: '',
      LIVEKIT_API_KEY: '',
      LIVEKIT_API_SECRET: '',
    };

/** Parsed list of allowed browser origins (from CLIENT_URL, comma separated). */
export const allowedOrigins: string[] = String(env.CLIENT_URL)
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const isSupabaseConfigured = (): boolean =>
  Boolean(env.SUPABASE_URL?.trim() && env.SUPABASE_SERVICE_ROLE_KEY?.trim());

export const isLiveKitConfigured = (): boolean =>
  Boolean(
    env.LIVEKIT_URL?.trim() &&
    env.LIVEKIT_API_KEY?.trim() &&
    env.LIVEKIT_API_SECRET?.trim()
  );
