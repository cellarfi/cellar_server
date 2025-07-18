import { getPointHistory, getUserPoints } from '@/controllers/pointsController';
import { getLeaderboard } from '@/controllers/leaderboardController';
import { authMiddleware } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

// Get current user's points
router.get('/me', authMiddleware, getUserPoints);

// Get specific user's points (if permissions allow)
router.get('/user/:user_id', authMiddleware, getUserPoints);

// Get point history for current user
router.get('/history', authMiddleware, getPointHistory);

// Get points leaderboard
router.get('/leaderboard', getLeaderboard);

export default router;
