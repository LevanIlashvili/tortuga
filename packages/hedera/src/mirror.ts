import axios from 'axios';
import { MIRROR_NODE_URLS, HEDERA_NETWORK, USDC_TOKEN_ID } from './constants';
import { PaymentTransaction } from './types';

const getMirrorNodeUrl = () => {
  return MIRROR_NODE_URLS[HEDERA_NETWORK as keyof typeof MIRROR_NODE_URLS];
};

async function fetchWithRetry(
  url: string,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<any> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await axios.get(url, { timeout: 10000 });
    } catch (error: any) {
      lastError = error;

      if (error.response?.status === 404) {
        throw new Error(`Resource not found: ${url}`);
      }

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw new Error(`Failed to fetch after ${maxRetries} attempts: ${lastError.message}`);
}

export async function monitorTreasuryPayments(
  treasuryAccountId: string,
  sinceTimestamp?: string
): Promise<PaymentTransaction[]> {
  const mirrorNodeUrl = getMirrorNodeUrl();
  const usdcTokenId = USDC_TOKEN_ID[HEDERA_NETWORK as keyof typeof USDC_TOKEN_ID];

  let url = `${mirrorNodeUrl}/api/v1/accounts/${treasuryAccountId}/transactions?transactiontype=cryptotransfer&order=desc`;

  if (sinceTimestamp) {
    url += `&timestamp=gt:${sinceTimestamp}`;
  }

  const response = await fetchWithRetry(url);
  const transactions = response.data.transactions || [];

  const payments: PaymentTransaction[] = [];

  for (const tx of transactions) {
    if (tx.token_transfers) {
      const usdcTransfer = tx.token_transfers.find(
        (transfer: any) => transfer.token_id === usdcTokenId &&
                           transfer.account === treasuryAccountId &&
                           transfer.amount > 0
      );

      if (usdcTransfer) {
        const fromAccount = tx.token_transfers.find(
          (transfer: any) => transfer.token_id === usdcTokenId && transfer.amount < 0
        );

        payments.push({
          transactionId: tx.transaction_id,
          from: fromAccount?.account || '',
          to: treasuryAccountId,
          amount: Math.abs(usdcTransfer.amount).toString(),
          memo: Buffer.from(tx.memo_base64 || '', 'base64').toString('utf-8'),
          consensusTimestamp: tx.consensus_timestamp,
          tokenId: usdcTokenId,
        });
      }
    }
  }

  return payments;
}

export async function getAccountBalance(accountId: string): Promise<{
  hbarBalance: string;
  tokenBalances: Array<{ tokenId: string; balance: string }>;
}> {
  const mirrorNodeUrl = getMirrorNodeUrl();
  const url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}`;

  const response = await fetchWithRetry(url);
  const account = response.data;

  return {
    hbarBalance: account.balance?.balance || '0',
    tokenBalances: (account.balance?.tokens || []).map((token: any) => ({
      tokenId: token.token_id,
      balance: token.balance.toString(),
    })),
  };
}

export async function getTransactionDetails(transactionId: string): Promise<any> {
  const mirrorNodeUrl = getMirrorNodeUrl();
  const url = `${mirrorNodeUrl}/api/v1/transactions/${transactionId}`;

  const response = await fetchWithRetry(url);
  return response.data.transactions?.[0] || null;
}

export async function getTokenBalances(
  accountId: string,
  tokenId?: string
): Promise<Array<{ tokenId: string; balance: string }>> {
  const mirrorNodeUrl = getMirrorNodeUrl();
  let url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}/tokens`;

  if (tokenId) {
    url += `?token.id=${tokenId}`;
  }

  const response = await fetchWithRetry(url);
  const tokens = response.data.tokens || [];

  return tokens.map((token: any) => ({
    tokenId: token.token_id,
    balance: token.balance.toString(),
  }));
}

export async function getAccountInfo(accountId: string): Promise<{
  accountId: string;
  balance: string;
  publicKey: string;
  evmAddress: string;
}> {
  const mirrorNodeUrl = getMirrorNodeUrl();
  const url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}`;

  const response = await fetchWithRetry(url);
  const account = response.data;

  return {
    accountId: account.account,
    balance: account.balance?.balance || '0',
    publicKey: account.key?.key || '',
    evmAddress: account.evm_address || '',
  };
}
