import {
  createUser,
  deleteUser,
  getProfile,
  updateProfile,
} from '@/controllers/usersController';
import { Router } from 'express';

const router = Router();

router.get('/me', getProfile);
router.post('/', createUser);
router.patch('/me', updateProfile);
router.delete('/me', deleteUser);

export default router;
