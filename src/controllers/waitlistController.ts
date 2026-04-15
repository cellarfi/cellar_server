import { WaitlistService } from '@/service/waitlistService'
import { JoinWaitlistDto, joinWaitlistSchema } from '@/utils/dto/waitlist.dto'
import { Request, Response } from 'express'

export const joinWaitlist = async (
  req: Request<{}, {}, JoinWaitlistDto>,
  res: Response
): Promise<void> => {
  try {
    const { success, data, error } = await joinWaitlistSchema.safeParseAsync(
      req.body
    )

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const waitlistEntry = await WaitlistService.joinWaitlist(data.email)

    res.status(201).json({
      success: true,
      data: waitlistEntry,
    })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'Email is already on the waitlist',
      })
      return
    }

    console.error('[joinWaitlist] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred joining the waitlist',
    })
  }
}

export const getWaitlistEmails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const emails = await WaitlistService.getAllWaitlistEmails()

    res.status(200).json({
      success: true,
      data: emails,
    })
  } catch (err: any) {
    console.error('[getWaitlistEmails] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred fetching waitlist emails',
    })
  }
}

export const getWaitlistStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await WaitlistService.getWaitlistStats()

    res.status(200).json({
      success: true,
      data: stats,
    })
  } catch (err: any) {
    console.error('[getWaitlistStats] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred fetching waitlist stats',
    })
  }
}
