import { privyClient } from '@/utils/platforms.util'
import { NextFunction, Request, Response } from 'express'

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const accessToken = req.headers.authorization?.split(' ')[1]

  if (!accessToken) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const user = await privyClient.getUser({ idToken: accessToken })
    // console.log('user', user)

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!user.wallet?.address) {
      res.status(401).json({ error: 'User has not linked any wallet' })
      return
    }

    req.user = user
    req.user.id = user.id.split(':').pop() || user.id
    next()
  } catch (error) {
    console.error('Error verifying authentication:', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
}
