import { getSupabaseClient } from '../config/supabase';
import { SessionRecord } from '../types';

/**
 * Generates a clean, human-readable 6-character room code (e.g. "ABC123" or "RT7K2M").
 */
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export class SessionService {
  /**
   * Creates a new session record in Supabase.
   */
  static async createSession(title: string): Promise<SessionRecord> {
    const supabase = getSupabaseClient();

    let attempts = 0;
    let roomCode = '';
    let isUnique = false;

    // Ensure unique room code
    while (!isUnique && attempts < 5) {
      roomCode = generateRoomCode();
      const { data: existing } = await supabase
        .from('sessions')
        .select('id')
        .eq('room_code', roomCode)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate a unique room code. Please try again.');
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        room_code: roomCode,
        title: title.trim() || 'Roundtable Discussion',
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !session) {
      throw new Error(`Database error creating session: ${error?.message || 'Unknown error'}`);
    }

    return session as SessionRecord;
  }

  /**
   * Associates host participant with the session.
   */
  static async setHostParticipant(sessionId: string, hostParticipantId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('sessions')
      .update({ host_participant_id: hostParticipantId })
      .eq('id', sessionId);

    if (error) {
      console.error('[SessionService] Failed to set host participant:', error.message);
    }
  }

  /**
   * Retrieves a session by its unique ID.
   */
  static async getSessionById(sessionId: string): Promise<SessionRecord | null> {
    const supabase = getSupabaseClient();
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error finding session: ${error.message}`);
    }

    return session as SessionRecord | null;
  }

  /**
   * Retrieves an active session by room code.
   */
  static async getSessionByRoomCode(roomCode: string): Promise<SessionRecord | null> {
    const supabase = getSupabaseClient();
    const normalizedCode = roomCode.trim().toUpperCase();

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('room_code', normalizedCode)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error finding session: ${error.message}`);
    }

    return session as SessionRecord | null;
  }

  /**
   * Ends an active session.
   */
  static async endSession(
    sessionId: string,
    hostParticipantId?: string
  ): Promise<SessionRecord> {
    const session = await this.getSessionById(sessionId);

    if (!session) {
      const err = new Error('Session not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (session.status === 'ended') {
      const err = new Error('This session has already ended');
      (err as any).statusCode = 400;
      throw err;
    }

    // Host check with documented development-only limitation
    if (hostParticipantId && session.host_participant_id) {
      if (session.host_participant_id !== hostParticipantId) {
        const err = new Error('Only the session host can end this session (dev check)');
        (err as any).statusCode = 403;
        throw err;
      }
    }

    const supabase = getSupabaseClient();
    const { data: updated, error } = await supabase
      .from('sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Database error ending session: ${error?.message || 'Unknown error'}`);
    }

    return updated as SessionRecord;
  }
}
