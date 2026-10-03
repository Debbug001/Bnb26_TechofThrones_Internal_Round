import { Router } from 'express';
import { SessionsController } from '../controllers/sessions.controller';

const router = Router();

// Create new session with host participant
router.post('/', SessionsController.createSession);

// Join existing active session as guest
router.post('/join', SessionsController.joinSession);

// Get session metadata
router.get('/:sessionId', SessionsController.getSessionDetails);

// List real participants in session
router.get('/:sessionId/participants', SessionsController.getParticipants);

// Mark participant as left
router.post('/:sessionId/leave', SessionsController.leaveSession);

// End session
router.post('/:sessionId/end', SessionsController.endSession);

// Generate individual LiveKit room token
router.post('/:sessionId/livekit-token', SessionsController.getLiveKitToken);

export default router;
