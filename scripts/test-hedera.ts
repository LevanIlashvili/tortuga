#!/usr/bin/env tsx

import { getClient, closeClient, getAccountBalance } from '@tortuga/hedera';

async function main() {
  console.log('🧪 Testing Hedera connection...\n');

  try {
    const client = getClient();
    const operatorId = process.env.HEDERA_OPERATOR_ID;

    if (!operatorId) {
      throw new Error('HEDERA_OPERATOR_ID not set in environment');
    }

    console.log(`📡 Network: ${process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet'}`);
    console.log(`👤 Operator Account: ${operatorId}\n`);

    console.log('🔍 Fetching account balance...');
    const balance = await getAccountBalance(operatorId);
    console.log(`✅ HBAR Balance: ${(parseInt(balance.hbarBalance) / 100000000).toFixed(2)} ℏ`);
    console.log(`✅ Token Balances: ${balance.tokenBalances.length} tokens\n`);

    console.log('🎉 Connection test successful!');
    console.log('✅ Your Hedera account is configured correctly.\n');

    closeClient();
  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

main();
