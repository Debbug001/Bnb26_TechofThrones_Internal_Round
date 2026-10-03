/**
 * Roundtable Backend Types — Phase 2
 */

export type DeviceType = 'desktop' | 'laptop' | 'phone' | 'tablet' | 'unknown';
export type LanguageCode = 'en' | 'hi' | 'mr';
export type SessionStatus = 'active' | 'ended';

export interface SessionRecord {
  id: string;
  room_code: string;
  title: string;
  host_participant_id: string | null;
  status: SessionStatus;
  created_at: string;
  ended_at: string | null;
}

export interface ParticipantRecord {
  id: string;
  session_id: string;
  display_name: string;
  participant_identity: string;
  device_type: DeviceType;
  preferred_caption_language: LanguageCode;
  speech_language: LanguageCode;
  joined_at: string;
  left_at: string | null;
  is_guest: boolean;
}

/**
 * Separate Audio Source Architecture (Phase 2 Foundation for Phase 3 Audio)
 * Treats every participant's microphone as an independent source.
 */
export interface ParticipantAudioTrackSource {
  participantId: string;
  participantIdentity: string;
  sessionId: string;
  deviceType: DeviceType;
  uniqueLiveKitIdentity: string;
}

/**
 * Prepared model for future independent audio transcripts.
 * Designed to reference isolated source tracks rather than mixed audio.
 */
export interface FutureTranscriptRecordDraft {
  sessionId: string;
  participantId: string;
  sourceTrackId: string;
  startTimestamp: number;
  endTimestamp: number;
  originalText: string;
  detectedLanguage: LanguageCode;
  confidence: number;
}
