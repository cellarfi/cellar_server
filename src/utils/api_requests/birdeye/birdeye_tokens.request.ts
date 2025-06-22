import { BirdEyeTokenOverview } from '@/types'
import axios, { AxiosInstance } from 'axios'
import { apiResponse, birdEyeHeader } from '../../api.helpers'

const api: AxiosInstance = axios.create({
  baseURL: 'https://public-api.birdeye.so/defi/v3',
  headers: birdEyeHeader,
})

export const birdEyeTokensRequests = {
  tokenOverview: async (tokenAddress: string) => {
    try {
      const res = await api.get(`/token_overview`, {
        params: {
          address: tokenAddress,
        },
      })

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
