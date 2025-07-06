import { PrivyClient } from '@privy-io/server-auth'
import { Env } from './constants/Env'

export const privyClient = new PrivyClient(
  Env.PRIVY_APP_ID,
  Env.PRIVY_APP_SECRET
)
