import { env, isLiveKitConfigured } from './env';

export interface LiveKitConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
}

export const getLiveKitConfig = (): LiveKitConfig => {
  if (!isLiveKitConfigured()) {
    throw new Error(
      'LiveKit is not configured. Please define LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in your .env file.'
    );
  }

  return {
    url: env.LIVEKIT_URL,
    apiKey: env.LIVEKIT_API_KEY,
    apiSecret: env.LIVEKIT_API_SECRET,
  };
};
