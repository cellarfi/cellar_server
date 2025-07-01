import { Env } from '@/utils/constants/Env';
import { PrivyClient } from '@privy-io/server-auth';
import { NextFunction, Request, Response } from 'express';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const idToken = req.headers.authorization?.split(' ')[1];

  if (!idToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const privyClient = new PrivyClient(Env.PRIVY_APP_ID, Env.PRIVY_APP_SECRET);
    const user = await privyClient.getUser({ idToken });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!user.wallet?.address) {
      res.status(401).json({ error: 'User has not linked any wallet' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
