import {
  getWalletHistory,
  getWalletPortfolio,
} from '@/controllers/walletController'
import { Router } from 'express'
import addressBookRoutes from './addressBook'

const router = Router()

router.get('/portfolio/:walletAddress', getWalletPortfolio)
router.get('/history/:walletAddress', getWalletHistory)

// Add address book routes under /api/wallet/address-book
router.use('/address-book', addressBookRoutes)

export default router
