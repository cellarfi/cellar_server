import {
  createUser,
  deleteUser,
  getProfile,
  updateProfile,
} from '@/controllers/usersController';
import { authMiddleware } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/me', authMiddleware, getProfile);
router.post('/', authMiddleware, createUser);
router.patch('/me', authMiddleware, updateProfile);
router.delete('/me', authMiddleware, deleteUser);

export default router;
