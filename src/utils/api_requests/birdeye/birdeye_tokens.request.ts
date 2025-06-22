import { BirdEyeTokenOverview } from '@/types'
import { birdEyeHeader } from '@/utils/birdeye.util'
import axios, { AxiosInstance } from 'axios'
import { apiResponse } from '../../api.helpers'
import { NATIVE_SOL_MINT, WRAPPED_SOL_MINT } from '../../solana.util'

const api: AxiosInstance = axios.create({
  baseURL: 'https://public-api.birdeye.so/defi',
  headers: birdEyeHeader,
})

export const birdEyeTokensRequests = {
  tokenOverview: async (tokenAddress: string) => {
    try {
      const addressToUse =
        tokenAddress === NATIVE_SOL_MINT ? WRAPPED_SOL_MINT : tokenAddress

      const res = await api.get(`/token_overview`, {
        params: {
          address: addressToUse,
        },
      })

      if (tokenAddress === NATIVE_SOL_MINT) {
        res.data.data.address = NATIVE_SOL_MINT
        res.data.data.name = 'SOL'
        res.data.data.symbol = 'SOL'
      }

      return apiResponse<BirdEyeTokenOverview>(
        true,
        'Fetched token overview',
        res.data.data
      )
    } catch (err: any) {
      console.log('Error fetching token overview:', err?.response?.data)
      return apiResponse<BirdEyeTokenOverview>(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        undefined
      )
    }
  },
}
