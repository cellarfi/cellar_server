import { z } from 'zod'

export const joinWaitlistSchema = z.object({
  email: z.string().trim().email(),
})

export type JoinWaitlistDto = z.infer<typeof joinWaitlistSchema>
