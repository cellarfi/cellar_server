import { z } from 'zod'

export const createPost = z.object({
  content: z.string(),
  user_id: z.string(),
})

// Enhanced post creation for fundraising posts
export const createFundraisingPost = z.object({
  content: z.string(),
  user_id: z.string(),
  post_type: z.enum(['TOKEN_CALL', 'DONATION']),

  // Funding metadata fields
  target_amount: z.number().positive(),
  wallet_address: z.string(),
  chain_type: z.string(),
  token_symbol: z.string().optional(),
  token_address: z.string().optional(),
  deadline: z.string().datetime().optional(), // ISO date string
})

// DTO for creating funding metadata separately
export const createFundingMeta = z.object({
  post_id: z.string(),
  target_amount: z.number().positive(),
  wallet_address: z.string(),
  chain_type: z.string(),
  token_symbol: z.string().optional(),
  token_address: z.string().optional(),
  deadline: z.string().datetime().optional(),
})

// DTO for updating funding metadata
export const updateFundingMeta = z.object({
  post_id: z.string(),
  target_amount: z.number().positive().optional(),
  wallet_address: z.string().optional(),
  chain_type: z.string().optional(),
  token_symbol: z.string().optional(),
  token_address: z.string().optional(),
  deadline: z.string().datetime().optional(),
  current_amount: z.number().optional(),
})

export const addLike = z.object({
  post_id: z.string(),
  user_id: z.string(),
})

export const createCommentSchema = z.object({
  post_id: z.string(),
  text: z.string(),
  user_id: z.string(),
  parent_id: z.string().optional()
})

export const deleteLike = z.object({
  id: z.string(),
  post_id: z.string(),
  user_id: z.string(),
})

export const deleteComment = z.object({
  id: z.string(),
  post_id: z.string(),
  user_id: z.string(),
})

export const tipUser = z.object({
  post_id: z.string(),
  amount: z.number(),
})

// Donation schema (unchanged)
export const createDonation = z.object({
  post_id: z.string(),
  amount: z.number().positive(),
  token_symbol: z.string().default('SOL'),
  transaction_id: z.string().optional(),
  wallet_address: z.string(),
  message: z.string().optional(),
  donor_user_id: z.string().optional(), // Optional if donor is registered user
})

// Update fundraising status (now updates funding_meta)
export const updateFundraisingStatus = z.object({
  post_id: z.string(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED']),
})

// Token Call DTOs - Simplified to match actual schema
export const createTokenCall = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  token_name: z.string().min(1, 'Token name is required'),
  token_symbol: z.string().min(1, 'Token symbol is required'),
  token_address: z.string().min(1, 'Token address is required'),
  chain_type: z.string().min(1, 'Chain type is required'),
  logo_url: z.string().url().optional(),
  launch_date: z.string().datetime().optional(),
  initial_price: z.number().positive().optional(),
  target_price: z.number().positive().optional(),
  market_cap: z.number().positive().optional(),
  description: z.string().optional(),
})

export const updateTokenCall = z.object({
  post_id: z.string(),
  token_name: z.string().min(1).optional(),
  token_symbol: z.string().min(1).optional(),
  token_address: z.string().min(1).optional(),
  chain_type: z.string().min(1).optional(),
  logo_url: z.string().url().optional(),
  launch_date: z.string().datetime().optional(),
  initial_price: z.number().positive().optional(),
  target_price: z.number().positive().optional(),
  market_cap: z.number().positive().optional(),
  description: z.string().optional(),
})

// Unified post creation schema that validates all post types
export const createUnifiedPost = z.discriminatedUnion('post_type', [
  // Regular post
  z.object({
    content: z.string().min(1, 'Content cannot be empty'),
    post_type: z.literal('REGULAR'),
  }),

  // Donation post
  z.object({
    content: z.string().min(1, 'Content cannot be empty'),
    post_type: z.literal('DONATION'),
    target_amount: z.number().positive('Target amount must be positive'),
    wallet_address: z.string().min(1, 'Wallet address is required'),
    chain_type: z.string().min(1, 'Chain type is required'),
    token_symbol: z.string().optional(),
    token_address: z.string().optional(),
    deadline: z.string().datetime().optional(),
  }),

  // Token call post
  z.object({
    content: z.string().min(1, 'Content cannot be empty'),
    post_type: z.literal('TOKEN_CALL'),
    token_name: z.string().min(1, 'Token name is required'),
    token_symbol: z.string().min(1, 'Token symbol is required'),
    token_address: z.string().min(1, 'Token address is required'),
    chain_type: z.string().min(1, 'Chain type is required'),
    logo_url: z.string().url().optional(),
    launch_date: z.string().datetime().optional(),
    initial_price: z.number().positive().optional(),
    target_price: z.number().positive().optional(),
    market_cap: z.number().positive().optional(),
    description: z.string().optional(),
  }),
])

export type CreatePostDto = z.infer<typeof createPost>
export type CreateFundraisingPostDto = z.infer<typeof createFundraisingPost>
export type CreateFundingMetaDto = z.infer<typeof createFundingMeta>
export type UpdateFundingMetaDto = z.infer<typeof updateFundingMeta>
export type addLikeDto = z.infer<typeof addLike>
export type createCommentDto = z.infer<typeof createCommentSchema>
export type deleteLikeDto = z.infer<typeof deleteLike>
export type deleteCommentDto = z.infer<typeof deleteComment>
export type tipUserDto = z.infer<typeof tipUser>
export type CreateDonationDto = z.infer<typeof createDonation>
export type UpdateFundraisingStatusDto = z.infer<typeof updateFundraisingStatus>
export type CreateTokenCallDto = z.infer<typeof createTokenCall>
export type UpdateTokenCallDto = z.infer<typeof updateTokenCall>
export type CreateUnifiedPostDto = z.infer<typeof createUnifiedPost>
