import { AccountId, PrivateKey, TokenId } from '@hashgraph/sdk';

export interface HederaConfig {
  network: 'mainnet' | 'testnet';
  operatorId: string;
  operatorKey: string;
}

export interface TokenCreationParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  maxSupply: number;
  treasuryAccountId: string;
  adminKey?: PrivateKey;
  supplyKey?: PrivateKey;
  kycKey?: PrivateKey;
  freezeKey?: PrivateKey;
  wipeKey?: PrivateKey;
}

export interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  treasuryAccountId: string;
}

export interface PaymentTransaction {
  transactionId: string;
  from: string;
  to: string;
  amount: string;
  memo: string;
  consensusTimestamp: string;
  tokenId?: string;
}

export interface ComplianceEvent {
  type: string;
  data: Record<string, any>;
  actor: string;
  timestamp: Date;
}
