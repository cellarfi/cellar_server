import { birdEyeRequests } from '@/utils/api_requests/birdeye.request'
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
