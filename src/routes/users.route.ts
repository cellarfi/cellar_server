import {
  checkIfTagNameExists,
  createUser,
  deleteUser,
  getProfile,
  getUserByTagName,
  getUserProfile,
  searchUsers,
  updateProfile,
} from '@/controllers/usersController'
import { authMiddleware } from '@/middleware/auth.middleware'
import { Router } from 'express'

const router = Router()

router.get('/me', authMiddleware, getProfile)
router.get('/exists/tag_name/:tag_name', checkIfTagNameExists)
router.get('/tag_name/:tag_name', getUserByTagName)
router.get('/search', authMiddleware, searchUsers) // Search users
router.get('/profile/:tag_name', authMiddleware, getUserProfile) // Get user profile
router.post('/', authMiddleware, createUser)
router.patch('/me', authMiddleware, updateProfile)
router.delete('/me', authMiddleware, deleteUser)

export default router
