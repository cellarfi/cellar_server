import { createComment, deleteComment } from '@/controllers/commentController'
import { authMiddleware } from '@/middleware/auth.middleware'
import { Router } from 'express'

const router = Router()

// Comment routes
router.post('/', authMiddleware, createComment) // Create comment on post
router.delete('/', authMiddleware, deleteComment) // Delete comment

export default router
