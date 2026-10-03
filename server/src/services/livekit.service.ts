import { AccessToken } from 'livekit-server-sdk';
import { getLiveKitConfig } from '../config/livekit';
import { ParticipantRecord, SessionRecord } from '../types';

export interface LiveKitTokenResult {
  livekitUrl: string;
  token: string;
  roomName: string;
}

export class LiveKitService {
  /**
   * Generates a secure, individual LiveKit access token for a participant.
   * Every participant receives an isolated token linked to their unique identity.
   */
  static async generateParticipantToken(
    session: SessionRecord,
    participant: ParticipantRecord
  ): Promise<LiveKitTokenResult> {
    const config = getLiveKitConfig();

    // Stable room name derived from session ID
    const roomName = `roundtable_${session.id}`;

    // Token with participant identity and 2-hour TTL
    const at = new AccessToken(config.apiKey, config.apiSecret, {
      identity: participant.participant_identity,
      name: participant.display_name,
      ttl: '2h',
      metadata: JSON.stringify({
        sessionId: session.id,
        participantId: participant.id,
        deviceType: participant.device_type,
        captionLanguage: participant.preferred_caption_language,
        speechLanguage: participant.speech_language,
      }),
    });

    // Grant isolated audio publishing & multi-source subscription
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return {
      livekitUrl: config.url,
      token,
      roomName,
    };
  }
}
