export type ActiveView = 'landing' | 'live_session' | 'session_results' | 'my_sessions';

export type DeviceConnectionState = 'connected' | 'syncing' | 'reconnecting';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  role: 'host' | 'participant';
  deviceType: 'Laptop' | 'Phone' | 'Tablet';
  connectionState: DeviceConnectionState;
  isMuted: boolean;
  isSpeaking: boolean;
  joinedAt: string;
  accentColor: string;
}

export interface Caption {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: string;
  deviceType?: 'Laptop' | 'Phone' | 'Tablet';
  accentColor: string;
  isStreaming?: boolean;
}

export interface SessionData {
  roomId: string;
  sessionName: string;
  hostName: string;
  createdAt: string;
  durationSeconds: number;
  shareableUrl: string;
  backendSessionId?: string;
  backendParticipantId?: string;
  backendParticipantIdentity?: string;
  participants: Participant[];
  captions: Caption[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Array<{
    timestamp: string;
    speaker: string;
    snippet: string;
  }>;
  structuredType?: 'summary' | 'speaker_summary' | 'decisions' | 'action_items' | 'qa';
  sections?: Array<{
    title: string;
    points: string[];
    timestampBadge?: string;
  }>;
}

export interface SavedSessionItem {
  id: string;
  sessionName: string;
  date: string;
  durationFormatted: string;
  durationSeconds: number;
  roomId: string;
  speakerCount: number;
  captions: Caption[];
  participants: Participant[];
}
