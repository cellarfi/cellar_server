import {
  getWalletHistory,
  getWalletPortfolio,
} from '@/controllers/walletController'
import { Router } from 'express'

const router = Router()

router.get('/portfolio/:walletAddress', getWalletPortfolio)
router.get('/history/:walletAddress', getWalletHistory)

export default router
