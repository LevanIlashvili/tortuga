import {
  TokenCreateTransaction,
  TokenInfoQuery,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TokenType,
  TokenSupplyType,
  AccountId,
  PrivateKey,
} from '@hashgraph/sdk';
import { getClient, getPrivateKey } from './client';
import { TokenCreationParams, TokenInfo } from './types';
import { TOKEN_DECIMALS } from './constants';

export async function createPropertyToken(params: TokenCreationParams): Promise<string> {
  const client = getClient();

  const adminKey = params.adminKey || getPrivateKey('HEDERA_ADMIN_KEY');
  const supplyKey = params.supplyKey || getPrivateKey('HEDERA_SUPPLY_KEY');
  const kycKey = params.kycKey || getPrivateKey('HEDERA_KYC_KEY');
  const freezeKey = params.freezeKey || getPrivateKey('HEDERA_FREEZE_KEY');
  const wipeKey = params.wipeKey || getPrivateKey('HEDERA_WIPE_KEY');

  const transaction = new TokenCreateTransaction()
    .setTokenName(params.name)
    .setTokenSymbol(params.symbol)
    .setDecimals(params.decimals)
    .setInitialSupply(params.initialSupply)
    .setTreasuryAccountId(AccountId.fromString(params.treasuryAccountId))
    .setTokenType(TokenType.FungibleCommon)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(params.maxSupply)
    .setAdminKey(adminKey)
    .setSupplyKey(supplyKey)
    .setKycKey(kycKey)
    .setFreezeKey(freezeKey)
    .setWipeKey(wipeKey)
    .freezeWith(client);

  const signedTx = await transaction.sign(adminKey);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);

  if (!receipt.tokenId) {
    throw new Error('Failed to create token: No token ID in receipt');
  }

  return receipt.tokenId.toString();
}

export async function getTokenInfo(tokenId: string): Promise<TokenInfo> {
  const client = getClient();

  const query = new TokenInfoQuery().setTokenId(tokenId);
  const info = await query.execute(client);

  return {
    tokenId: info.tokenId.toString(),
    name: info.name,
    symbol: info.symbol,
    decimals: info.decimals,
    totalSupply: info.totalSupply.toString(),
    treasuryAccountId: info.treasuryAccountId.toString(),
  };
}

export async function mintTokens(
  tokenId: string,
  amount: number,
  supplyKey?: PrivateKey
): Promise<string> {
  const client = getClient();
  const key = supplyKey || getPrivateKey('HEDERA_SUPPLY_KEY');

  const transaction = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(amount)
    .freezeWith(client);

  const signedTx = await transaction.sign(key);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);

  return txResponse.transactionId.toString();
}

export async function associateToken(
  accountId: string,
  tokenId: string,
  accountKey: PrivateKey
): Promise<string> {
  const client = getClient();

  const transaction = new TokenAssociateTransaction()
    .setAccountId(AccountId.fromString(accountId))
    .setTokenIds([tokenId])
    .freezeWith(client);

  const signedTx = await transaction.sign(accountKey);
  const txResponse = await signedTx.execute(client);
  await txResponse.getReceipt(client);

  return txResponse.transactionId.toString();
}
