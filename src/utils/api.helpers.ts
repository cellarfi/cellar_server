import { ApiResponseInterface } from '@/types'
import { Env } from './constants/Env'

export const apiResponse = <D = any>(
  success: boolean,
  message: string,
  data?: D
): ApiResponseInterface<D> => {
  return {
    success,
    message,
    data,
  }
}

export const birdEyeHeader = {
  accept: 'application/json',
  'x-chain': 'solana',
  'X-API-KEY': Env.BIRDEYE_API_KEY,
}
