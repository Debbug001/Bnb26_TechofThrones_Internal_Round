import { getSupabaseClient } from '../config/supabase';
import { ParticipantRecord, DeviceType, LanguageCode } from '../types';

export interface CreateParticipantParams {
  sessionId: string;
  displayName: string;
  deviceType?: DeviceType;
  preferredCaptionLanguage?: LanguageCode;
  speechLanguage?: LanguageCode;
  isGuest?: boolean;
}

export class ParticipantService {
  /**
   * Registers a participant (host or guest) in Supabase.
   * Generates a unique participant identity per session.
   */
  static async registerParticipant(
    params: CreateParticipantParams
  ): Promise<ParticipantRecord> {
    const supabase = getSupabaseClient();

    // Unique identity for audio track routing and LiveKit session presence
    const uniqueIdentity = `p_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const { data: participant, error } = await supabase
      .from('participants')
      .insert({
        session_id: params.sessionId,
        display_name: params.displayName.trim(),
        participant_identity: uniqueIdentity,
        device_type: params.deviceType || 'laptop',
        preferred_caption_language: params.preferredCaptionLanguage || 'en',
        speech_language: params.speechLanguage || 'en',
        joined_at: new Date().toISOString(),
        is_guest: params.isGuest ?? true,
      })
      .select()
      .single();

    if (error || !participant) {
      throw new Error(`Database error registering participant: ${error?.message || 'Unknown error'}`);
    }

    return participant as ParticipantRecord;
  }

  /**
   * Retrieves all participants associated with a session.
   */
  static async getParticipantsBySessionId(sessionId: string): Promise<ParticipantRecord[]> {
    const supabase = getSupabaseClient();
    const { data: participants, error } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true });

    if (error) {
      throw new Error(`Database error retrieving participants: ${error.message}`);
    }

    return (participants || []) as ParticipantRecord[];
  }

  /**
   * Retrieves a specific participant record by ID within a session.
   */
  static async getParticipantById(
    sessionId: string,
    participantId: string
  ): Promise<ParticipantRecord | null> {
    const supabase = getSupabaseClient();
    const { data: participant, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error finding participant: ${error.message}`);
    }

    return participant as ParticipantRecord | null;
  }

  /**
   * Marks a participant as having left without deleting historical record.
   */
  static async markParticipantLeft(
    sessionId: string,
    participantId: string
  ): Promise<ParticipantRecord> {
    const participant = await this.getParticipantById(sessionId, participantId);

    if (!participant) {
      const err = new Error('Participant not found in this session');
      (err as any).statusCode = 404;
      throw err;
    }

    const supabase = getSupabaseClient();
    const { data: updated, error } = await supabase
      .from('participants')
      .update({ left_at: new Date().toISOString() })
      .eq('id', participantId)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Database error marking participant left: ${error?.message || 'Unknown error'}`);
    }

    return updated as ParticipantRecord;
  }
}
