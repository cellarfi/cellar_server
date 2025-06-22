import { BirdEyeTimePeriod } from '@/types'
import { birdEyeRequests } from '@/utils/api_requests/birdeye.request'
import { getBirdeyeTimeParams } from '@/utils/birdeye.util'
import { Request, Response } from 'express'

export const getTokenOverview = async (
  req: Request<
    { tokenAddress: string },
    {},
    {},
    { includeChart: boolean; walletAddress: string }
  >,
  res: Response
): Promise<void> => {
  try {
    const { tokenAddress } = req.params
    const { includeChart, walletAddress } = req.query

    const tokenOverview = await birdEyeRequests.tokens.tokenOverview(
      tokenAddress
    )

    if (!tokenOverview.success) {
      res.status(500).json({
        success: false,
        message: tokenOverview.message,
      })
      return
    }

    // Return the result
    res.json(tokenOverview.data)
  } catch (err: any) {
    console.error('[getTokenOverview] Error:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred processing your swap request',
    })
  }
}

export const search = async (
  req: Request<{}, {}, {}, { keyword: string }>,
  res: Response
): Promise<void> => {
  try {
    const { keyword } = req.query

    const tokenOverview = await birdEyeRequests.utils.search({
      keyword,
    })

    if (!tokenOverview.success) {
      res.status(500).json({
        success: false,
        message: tokenOverview.message,
      })
      return
    }

    // Return the result
    res.json({
      tokenOverview: tokenOverview.data,
    })
  } catch (err: any) {
    console.error('[raydiumSwapHandler] Error:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred processing your swap request',
    })
  }
}

export const getHistoricalPrice = async (
  req: Request<
    { tokenAddress: string },
    {},
    {},
    {
      type: BirdEyeTimePeriod
      time_from: number
      time_to: number
      address_type: 'token' | 'pair'
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { tokenAddress } = req.params
    const { type, time_from, time_to, address_type } = req.query

    const params = getBirdeyeTimeParams(type || '1H')

    const tokenOverview = await birdEyeRequests.defi.historicalPrice({
      tokenAddress,
      type: type || '1H',
      time_from: time_from || params.time_from,
      time_to: time_to || params.time_to,
      address_type: address_type || 'token',
    })

    if (!tokenOverview.success) {
      res.status(500).json({
        success: false,
        message: tokenOverview.message,
      })
      return
    }

    // Return the result
    res.json({
      tokenOverview: tokenOverview.data,
    })
  } catch (err: any) {
    console.error('[raydiumSwapHandler] Error:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred processing your swap request',
    })
  }
}

export const getOHLCV = async (
  req: Request<
    { tokenAddress: string },
    {},
    {},
    {
      type: BirdEyeTimePeriod
      time_from: number
      time_to: number
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { tokenAddress } = req.params
    const { type, time_from, time_to } = req.query

    const params = getBirdeyeTimeParams(type || '1H')

    const tokenOverview = await birdEyeRequests.defi.tokenOHLCV({
      tokenAddress,
      type: type || '1H',
      currency: 'usd',
      time_from: time_from || params.time_from,
      time_to: time_to || params.time_to,
    })

    if (!tokenOverview.success) {
      res.status(500).json({
        success: false,
        message: tokenOverview.message,
      })
      return
    }

    // Return the result
    res.json({
      tokenOverview: tokenOverview.data,
    })
  } catch (err: any) {
    console.error('[raydiumSwapHandler] Error:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred processing your swap request',
    })
  }
}
