import { privyClient } from '@/utils/platforms.util'
import { Request } from 'express'

export const getUserByAccessToken = async (req: Request) => {
  const accessToken = req.headers.authorization?.split(' ')[1]

  if (!accessToken) {
    throw new Error('Unauthorized: No access token provided')
  }

  const user = await privyClient.getUser({ idToken: accessToken })
  
  if (!user) {
    throw new Error('Unauthorized: User not found')
  }

  if (!user.wallet?.address) {
    throw new Error('Unauthorized: User has not linked any wallet')
  }

  return user
}

export const getUserByToken = async (req: Request) => {
  try {
    const user = await getUserByAccessToken(req)
    req.user = user
    return user
  } catch (error) {
    console.error('Error verifying authentication:', error)
    throw error
  }
}
