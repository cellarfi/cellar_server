import {
  getWaitlistEmails,
  getWaitlistStats,
  joinWaitlist,
} from '@/controllers/waitlistController'
import { Router } from 'express'

const router = Router()

router.post('/join', joinWaitlist)
router.get('/emails', getWaitlistEmails)
router.get('/stats', getWaitlistStats)

export default router
