/**
 * Roundtable API Service Client
 * Provides modular HTTP methods for frontend-to-backend communication.
 */

export interface HealthResponse {
  success: boolean;
  message: string;
  status: 'healthy' | string;
  timestamp: string;
}

export type ConnectionStatus = 'checking' | 'connected' | 'unavailable';

export interface CreateSessionPayload {
  title?: string;
  displayName: string;
  deviceType?: 'desktop' | 'laptop' | 'phone' | 'tablet' | 'unknown';
  preferredCaptionLanguage?: 'en' | 'hi' | 'mr';
  speechLanguage?: 'en' | 'hi' | 'mr';
}

export interface JoinSessionPayload {
  roomCode: string;
  displayName: string;
  deviceType?: 'desktop' | 'laptop' | 'phone' | 'tablet' | 'unknown';
  preferredCaptionLanguage?: 'en' | 'hi' | 'mr';
  speechLanguage?: 'en' | 'hi' | 'mr';
}

export interface SessionResponseData {
  success: boolean;
  message?: string;
  session?: {
    id: string;
    roomCode: string;
    title: string;
    status: 'active' | 'ended';
  };
  participant?: {
    id: string;
    displayName: string;
    identity: string;
  };
}

export interface BackendParticipantItem {
  id: string;
  displayName: string;
  participantIdentity: string;
  deviceType: string;
  preferredCaptionLanguage: string;
  speechLanguage: string;
  joinedAt: string;
  leftAt: string | null;
  isOnline: boolean;
  isGuest: boolean;
}

export interface LiveKitTokenResponse {
  success: boolean;
  message?: string;
  livekitUrl?: string;
  token?: string;
  roomName?: string;
  participantIdentity?: string;
}

// Fallback to configured default VITE_API_URL (http://localhost:5000)
const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:5000';

/**
 * Checks backend health status via GET /api/health
 */
export async function checkBackendHealth(): Promise<{
  status: ConnectionStatus;
  data?: HealthResponse;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        status: 'unavailable',
        error: `HTTP ${response.status}`,
      };
    }

    const data: HealthResponse = await response.json();
    return {
      status: data.success && data.status === 'healthy' ? 'connected' : 'unavailable',
      data,
    };
  } catch (err: unknown) {
    return {
      status: 'unavailable',
      error: err instanceof Error ? err.message : 'Connection failed',
    };
  }
}

/**
 * POST /api/sessions - Creates a new session in Supabase and registers host
 */
export async function createSession(
  payload: CreateSessionPayload
): Promise<SessionResponseData> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || `Failed to create session (${response.status})`);
  }

  return data as SessionResponseData;
}

/**
 * POST /api/sessions/join - Joins an active session by room code as guest
 */
export async function joinSession(
  payload: JoinSessionPayload
): Promise<SessionResponseData> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || `Failed to join session (${response.status})`);
  }

  return data as SessionResponseData;
}

/**
 * GET /api/sessions/:sessionId/participants - Retrieves real participants
 */
export async function getSessionParticipants(
  sessionId: string
): Promise<{ success: boolean; participants: BackendParticipantItem[]; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/participants`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch session participants');
  }

  return data;
}

/**
 * POST /api/sessions/:sessionId/leave - Marks participant as left
 */
export async function leaveSession(
  sessionId: string,
  participantId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ participantId }),
  });

  return response.json();
}

/**
 * POST /api/sessions/:sessionId/end - Ends session
 */
export async function endSession(
  sessionId: string,
  hostParticipantId?: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ hostParticipantId }),
  });

  return response.json();
}

/**
 * POST /api/sessions/:sessionId/livekit-token - Requests LiveKit token
 */
export async function getLiveKitToken(
  sessionId: string,
  participantId: string
): Promise<LiveKitTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/livekit-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ participantId }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to generate LiveKit token');
  }

  return data;
}

export const api = {
  baseUrl: API_BASE_URL,
  checkBackendHealth,
  createSession,
  joinSession,
  getSessionParticipants,
  leaveSession,
  endSession,
  getLiveKitToken,
};
