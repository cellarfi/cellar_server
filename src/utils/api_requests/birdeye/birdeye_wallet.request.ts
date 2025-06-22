import {
  BirdEyeTokenItem,
  BirdEyeWalletBalanceChangeResponse,
  BirdEyeWalletPortfolio,
  BirdEyeWalletTransactionHistory,
} from '@/types'
import axios, { AxiosInstance } from 'axios'
import { apiResponse, birdEyeHeader } from '../../api.helpers'

const api: AxiosInstance = axios.create({
  baseURL: 'https://public-api.birdeye.so',
  headers: birdEyeHeader,
})

export const birdEyeWalletRequests = {
  getWalletPortfolio: async (wallet_address: string) => {
    try {
      const res = await api.get(`/v1/wallet/token_list`, {
        params: {
          wallet: wallet_address,
        },
      })

      return apiResponse<BirdEyeWalletPortfolio>(
        true,
        'Fetched rugged data',
        res.data.data
      )
    } catch (err: any) {
      console.log('Error fetching token report:', err?.response?.data)
      return apiResponse<BirdEyeWalletPortfolio>(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      )
    }
  },

  getWalletTokenBalance: async (
    wallet_address: string,
    token_address: string
  ) => {
    try {
      const res = await api.get(`/v1/wallet/token_balance`, {
        params: {
          wallet: wallet_address,
          token_address: token_address,
        },
      })

      return apiResponse<BirdEyeTokenItem>(
        true,
        'Fetched rugged data',
        res.data.data
      )
    } catch (err: any) {
      console.log('Error fetching token report:', err?.response?.data)
      return apiResponse<BirdEyeTokenItem>(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      )
    }
  },

  getWalletTransactionHistory: async (wallet_address: string) => {
    try {
      const res = await api.get(`/v1/wallet/tx_list`, {
        params: {
          wallet: wallet_address,
          limit: 100,
        },
      })

      return apiResponse<BirdEyeWalletTransactionHistory>(
        true,
        'Fetched rugged data',
        res.data.data
      )
    } catch (err: any) {
      console.log('Error fetching token report:', err?.response?.data)
      return apiResponse<BirdEyeWalletTransactionHistory>(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      )
    }
  },

  getWalletBalanceChange: async (
    wallet_address: string,
    token_address?: string
  ) => {
    try {
      const res = await api.get(`/wallet/v2/balance-change`, {
        params: {
          address: wallet_address,
          ...(token_address && { token_address }),
          offset: 0,
          limit: 20,
        },
      })

      return apiResponse<BirdEyeWalletBalanceChangeResponse>(
        true,
        'Fetched wallet balance change data',
        res.data.data
      )
    } catch (err: any) {
      console.log('Error fetching token report:', err?.response?.data)
      return apiResponse<BirdEyeWalletBalanceChangeResponse>(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        undefined
      )
    }
  },
}
