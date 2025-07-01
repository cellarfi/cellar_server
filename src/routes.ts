import express from 'express';
import auraRouter from './routes/aura';
import meteoraDBCRouter from './routes/meteora/meteoraDBCRoutes';
import nftRoutes from './routes/nft';
import { launchRouter } from './routes/pumpfun/pumpfunLaunch'; // import { buildCompressedNftListingTx } from './utils/compressedNftListing';
import { pumpSwapRouter } from './routes/pumpfun/pumpSwapRoutes';
import raydiumLaunchpadRoutes from './routes/raydium/launchpad.routes';
import jupiterSwapRouter from './routes/swap/jupiterSwapRoutes';
import raydiumSwapRouter from './routes/swap/raydiumSwapRoutes';
import tokenRoutes from './routes/token';
import walletRoutes from './routes/wallet';
import usersRoutes from './routes/users';

export const injectRoutes = (app: express.Express) => {
  app.use('/api/wallet', walletRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/token', tokenRoutes);
  app.use('/api/pumpfun', launchRouter);
  app.use('/api/jupiter', jupiterSwapRouter);
  app.use('/api/raydium/swap', raydiumSwapRouter);
  app.use('/api/raydium/launchpad', raydiumLaunchpadRoutes);
  app.use('/api/pump-swap', pumpSwapRouter);
  app.use('/api/aura', auraRouter);
  app.use('/api/meteora', meteoraDBCRouter);
  app.use('/api/nft', nftRoutes);
};
