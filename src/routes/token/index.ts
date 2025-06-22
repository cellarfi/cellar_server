import { getTokenOverview, search } from '@/controllers/tokenController'
import { Router } from 'express'

const router = Router()

router.get('/overview/:tokenAddress', getTokenOverview)
router.get('/search', search)

export default router
