import {
  getHistoricalPrice,
  getOHLCV,
  getTokenOverview,
  getTrendingTokens,
  search,
} from '@/controllers/tokenController'
import { Router } from 'express'

const router = Router()

router.get('/overview/:tokenAddress', getTokenOverview)
router.get('/search', search)
router.get('/historical-price/:tokenAddress', getHistoricalPrice)
router.get('/ohlcv/:tokenAddress', getOHLCV)
router.get('/trending', getTrendingTokens)

export default router
