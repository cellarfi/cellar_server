import { PublicKey } from '@solana/web3.js';

export const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111111';
export const WRAPPED_SOL_MINT = 'So11111111111111111111111111111111111111112';

export const isMintAddress = (address: string) => {
  // Solana addresses are 32-44 characters long and contain only base58 characters
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  return solanaAddressRegex.test(address);
};

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    if (!address) return false;

    const pubKey = new PublicKey(address);
    return PublicKey.isOnCurve(pubKey.toBytes());
  } catch {
    return false;
  }
};
