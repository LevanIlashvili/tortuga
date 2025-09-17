import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { HEDERA_NETWORK } from './constants';

let clientInstance: Client | null = null;

export function getClient(): Client {
  if (clientInstance) {
    return clientInstance;
  }

  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error('Hedera operator credentials not configured');
  }

  const client = HEDERA_NETWORK === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

  client.setOperator(
    AccountId.fromString(operatorId),
    PrivateKey.fromStringED25519(operatorKey)
  );

  clientInstance = client;
  return client;
}

export function getPrivateKey(keyEnvVar: string): PrivateKey {
  const key = process.env[keyEnvVar];
  if (!key) {
    throw new Error(`Environment variable ${keyEnvVar} not found`);
  }
  return PrivateKey.fromStringED25519(key);
}

export function closeClient(): void {
  if (clientInstance) {
    clientInstance.close();
    clientInstance = null;
  }
}
