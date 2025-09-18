import {
  TokenGrantKycTransaction,
  TokenRevokeKycTransaction,
  AccountId,
  PrivateKey,
} from '@hashgraph/sdk';
import { getClient, getPrivateKey } from './client';

export async function whitelistUser(
  tokenId: string,
  accountId: string,
  kycKey?: PrivateKey
): Promise<string> {
  const client = getClient();
  const key = kycKey || getPrivateKey('HEDERA_KYC_KEY');

  const transaction = new TokenGrantKycTransaction()
    .setTokenId(tokenId)
    .setAccountId(AccountId.fromString(accountId))
    .freezeWith(client);

  const signedTx = await transaction.sign(key);
  const txResponse = await signedTx.execute(client);
  await txResponse.getReceipt(client);

  return txResponse.transactionId.toString();
}

export async function batchWhitelistUsers(
  tokenId: string,
  accountIds: string[],
  kycKey?: PrivateKey
): Promise<string[]> {
  const results: string[] = [];

  for (const accountId of accountIds) {
    const txId = await whitelistUser(tokenId, accountId, kycKey);
    results.push(txId);
  }

  return results;
}

export async function removeFromWhitelist(
  tokenId: string,
  accountId: string,
  kycKey?: PrivateKey
): Promise<string> {
  const client = getClient();
  const key = kycKey || getPrivateKey('HEDERA_KYC_KEY');

  const transaction = new TokenRevokeKycTransaction()
    .setTokenId(tokenId)
    .setAccountId(AccountId.fromString(accountId))
    .freezeWith(client);

  const signedTx = await transaction.sign(key);
  const txResponse = await signedTx.execute(client);
  await txResponse.getReceipt(client);

  return txResponse.transactionId.toString();
}
