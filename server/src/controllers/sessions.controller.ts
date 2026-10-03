import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SessionService } from '../services/session.service';
import { ParticipantService } from '../services/participant.service';
import { LiveKitService } from '../services/livekit.service';
import { isSupabaseConfigured, isLiveKitConfigured } from '../config/env';

// Validation Schemas
const deviceTypeSchema = z.enum(['desktop', 'laptop', 'phone', 'tablet', 'unknown']);
const languageSchema = z.enum(['en', 'hi', 'mr']);

const createSessionSchema = z.object({
  title: z.string().trim().max(100).optional().default('Roundtable Discussion'),
  displayName: z.string().trim().min(1, 'Display name is required').max(50),
  deviceType: deviceTypeSchema.optional().default('laptop'),
  preferredCaptionLanguage: languageSchema.optional().default('en'),
  speechLanguage: languageSchema.optional().default('en'),
});

const joinSessionSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required').max(20),
  displayName: z.string().trim().min(1, 'Display name is required').max(50),
  deviceType: deviceTypeSchema.optional().default('phone'),
  preferredCaptionLanguage: languageSchema.optional().default('en'),
  speechLanguage: languageSchema.optional().default('en'),
});

const leaveSessionSchema = z.object({
  participantId: z.string().uuid('Valid participant ID is required'),
});

const endSessionSchema = z.object({
  hostParticipantId: z.string().uuid().optional(),
});

const livekitTokenSchema = z.object({
  participantId: z.string().uuid('Valid participant ID is required'),
});

const getParamString = (val: string | string[] | undefined): string => {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
};

export class SessionsController {
  /**
   * POST /api/sessions
   * Creates a new session and registers the host participant.
   */
  static async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        res.status(503).json({
          success: false,
          message: 'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        });
        return;
      }

      const parseResult = createSessionSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: parseResult.error.issues.map((i) => i.message).join(', '),
        });
        return;
      }

      const { title, displayName, deviceType, preferredCaptionLanguage, speechLanguage } =
        parseResult.data;

      // 1. Create session record
      const session = await SessionService.createSession(title);

      // 2. Register host participant
      const hostParticipant = await ParticipantService.registerParticipant({
        sessionId: session.id,
        displayName,
        deviceType,
        preferredCaptionLanguage,
        speechLanguage,
        isGuest: false,
      });

      // 3. Link host to session
      await SessionService.setHostParticipant(session.id, hostParticipant.id);

      res.status(201).json({
        success: true,
        session: {
          id: session.id,
          roomCode: session.room_code,
          title: session.title,
          status: session.status,
        },
        participant: {
          id: hostParticipant.id,
          displayName: hostParticipant.display_name,
          identity: hostParticipant.participant_identity,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/sessions/join
   * Validates room code and registers a guest participant.
   */
  static async joinSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        res.status(503).json({
          success: false,
          message: 'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        });
        return;
      }

      const parseResult = joinSessionSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: parseResult.error.issues.map((i) => i.message).join(', '),
        });
        return;
      }

      const { roomCode, displayName, deviceType, preferredCaptionLanguage, speechLanguage } =
        parseResult.data;

      // 1. Find session by room code
      const session = await SessionService.getSessionByRoomCode(roomCode);

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
        });
        return;
      }

      if (session.status === 'ended') {
        res.status(400).json({
          success: false,
          message: 'This session has ended',
        });
        return;
      }

      // 2. Register guest participant
      const participant = await ParticipantService.registerParticipant({
        sessionId: session.id,
        displayName,
        deviceType,
        preferredCaptionLanguage,
        speechLanguage,
        isGuest: true,
      });

      res.status(200).json({
        success: true,
        session: {
          id: session.id,
          roomCode: session.room_code,
          title: session.title,
          status: session.status,
        },
        participant: {
          id: participant.id,
          displayName: participant.display_name,
          identity: participant.participant_identity,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/sessions/:sessionId
   * Returns session details.
   */
  static async getSessionDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        res.status(503).json({
          success: false,
          message: 'Supabase is not configured',
        });
        return;
      }

      const sessionId = getParamString(req.params.sessionId);
      const session = await SessionService.getSessionById(sessionId);

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        session: {
          id: session.id,
          roomCode: session.room_code,
          title: session.title,
          status: session.status,
          hostParticipantId: session.host_participant_id,
          createdAt: session.created_at,
          endedAt: session.ended_at,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/sessions/:sessionId/participants
   * Returns list of participants in the session.
   */
  static async getParticipants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        res.status(503).json({
          success: false,
          message: 'Supabase is not configured',
        });
        return;
      }

      const sessionId = getParamString(req.params.sessionId);
      const session = await SessionService.getSessionById(sessionId);

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
        });
        return;
      }

      const participants = await ParticipantService.getParticipantsBySessionId(sessionId);

      res.status(200).json({
        success: true,
        participants: participants.map((p) => ({
          id: p.id,
          displayName: p.display_name,
          participantIdentity: p.participant_identity,
          deviceType: p.device_type,
          preferredCaptionLanguage: p.preferred_caption_language,
          speechLanguage: p.speech_language,
          joinedAt: p.joined_at,
          leftAt: p.left_at,
          isOnline: p.left_at === null,
          isGuest: p.is_guest,
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/sessions/:sessionId/leave
   * Marks a participant as having left.
   */
  static async leaveSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        res.status(503).json({
          success: false,
          message: 'Supabase is not configured',
        });
        return;
      }

      const sessionId = getParamString(req.params.sessionId);
      const parseResult = leaveSessionSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: parseResult.error.issues.map((i) => i.message).join(', '),
        });
        return;
      }

      const { participantId } = parseResult.data;
      await ParticipantService.markParticipantLeft(sessionId, participantId);

      res.status(200).json({
        success: true,
        message: 'Participant marked as left',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/sessions/:sessionId/end
   * Ends an active session.
   */
  static async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        res.status(503).json({
          success: false,
          message: 'Supabase is not configured',
        });
        return;
      }

      const sessionId = getParamString(req.params.sessionId);
      const parseResult = endSessionSchema.safeParse(req.body || {});

      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: parseResult.error.issues.map((i) => i.message).join(', '),
        });
        return;
      }

      const updated = await SessionService.endSession(
        sessionId,
        parseResult.data.hostParticipantId
      );

      res.status(200).json({
        success: true,
        message: 'Session ended successfully',
        session: {
          id: updated.id,
          roomCode: updated.room_code,
          status: updated.status,
          endedAt: updated.ended_at,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/sessions/:sessionId/livekit-token
   * Generates a unique, isolated LiveKit room token for a participant.
   */
  static async getLiveKitToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isLiveKitConfigured()) {
        res.status(503).json({
          success: false,
          message: 'LiveKit is not configured. Please define LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.',
        });
        return;
      }

      if (!isSupabaseConfigured()) {
        res.status(503).json({
          success: false,
          message: 'Supabase is not configured.',
        });
        return;
      }

      const sessionId = getParamString(req.params.sessionId);
      const parseResult = livekitTokenSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: parseResult.error.issues.map((i) => i.message).join(', '),
        });
        return;
      }

      const { participantId } = parseResult.data;

      // 1. Verify session exists and is active
      const session = await SessionService.getSessionById(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
        });
        return;
      }

      if (session.status === 'ended') {
        res.status(400).json({
          success: false,
          message: 'This session has ended',
        });
        return;
      }

      // 2. Verify participant belongs to this session
      const participant = await ParticipantService.getParticipantById(sessionId, participantId);
      if (!participant) {
        res.status(404).json({
          success: false,
          message: 'Participant not found in this session',
        });
        return;
      }

      // 3. Generate secure individual token
      const tokenResult = await LiveKitService.generateParticipantToken(session, participant);

      res.status(200).json({
        success: true,
        livekitUrl: tokenResult.livekitUrl,
        token: tokenResult.token,
        roomName: tokenResult.roomName,
        participantIdentity: participant.participant_identity,
      });
    } catch (err) {
      next(err);
    }
  }
}
