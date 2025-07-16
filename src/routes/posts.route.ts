import {
  createPost,
  getActiveFundraisingPosts,
  getFundingStats,
  getFundraisingPosts,
  getPost,
  getPosts,
  getTokenCallByAddress,
  getTokenCalls,
  getTrendingTokenCalls,
  getUserFundraisingPosts,
  markTokenAsLaunched,
  searchPosts,
  searchTokenCalls,
  trendingPosts,
  updateFundraisingStatus,
  updateTokenCall,
} from '@/controllers/postController'
import { authMiddleware } from '@/middleware/auth.middleware'
import { Router } from 'express'

const router = Router()

// Public routes
router.get('/trending', trendingPosts)
router.get('/fundraising', getFundraisingPosts)
router.get('/fundraising/active', getActiveFundraisingPosts)
router.get('/token-calls', getTokenCalls)
router.get('/token-calls/trending', getTrendingTokenCalls)
router.get('/token-calls/search', searchTokenCalls)
router.get('/token-calls/address/:token_address', getTokenCallByAddress)
router.get('/search', searchPosts)
router.get('/', getPosts)
router.get('/:id', getPost)

// Funding statistics (public)
router.get('/:post_id/funding-stats', getFundingStats)

// Protected routes (require authentication)
router.use(authMiddleware)

// Unified post creation - handles all post types
router.post('/', createPost)

// Legacy fundraising management (keeping for backward compatibility)
router.patch('/fundraising/status', updateFundraisingStatus)
router.get('/fundraising/user/:user_id?', getUserFundraisingPosts)

// Token call management
router.patch('/token-calls', updateTokenCall)
router.patch('/token-calls/launch', markTokenAsLaunched)

export default router
