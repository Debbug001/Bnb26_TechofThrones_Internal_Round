import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router = Router();

// GET /api/health - Public health check endpoint
router.get('/', getHealth);

export default router;
