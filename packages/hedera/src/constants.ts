export const HEDERA_NETWORK = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet';

export const MIRROR_NODE_URLS = {
  mainnet: 'https://mainnet-public.mirrornode.hedera.com',
  testnet: 'https://testnet.mirrornode.hedera.com',
};

export const USDC_TOKEN_ID = {
  mainnet: '0.0.456858',
  testnet: '0.0.429274',
};

export const HCS_MEMO_MAX_LENGTH = 100;
export const TOKEN_DECIMALS = 0;
export const PAYMENT_POLL_INTERVAL = 5000;
