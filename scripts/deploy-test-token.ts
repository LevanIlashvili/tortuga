#!/usr/bin/env tsx

import { createPropertyToken, getTokenInfo, closeClient } from '@tortuga/hedera';

async function main() {
  console.log('🪙 Deploying test token on Hedera...\n');

  try {
    const treasuryId = process.env.HEDERA_TREASURY_ID || process.env.HEDERA_OPERATOR_ID;

    if (!treasuryId) {
      throw new Error('HEDERA_TREASURY_ID or HEDERA_OPERATOR_ID not set');
    }

    console.log('🔨 Creating test property token...');
    const tokenId = await createPropertyToken({
      name: 'Test Property Token',
      symbol: 'TEST',
      decimals: 0,
      initialSupply: 0,
      maxSupply: 10000,
      treasuryAccountId: treasuryId,
    });

    console.log(`✅ Token created: ${tokenId}\n`);

    console.log('🔍 Fetching token info...');
    const info = await getTokenInfo(tokenId);
    console.log(`   Name: ${info.name}`);
    console.log(`   Symbol: ${info.symbol}`);
    console.log(`   Decimals: ${info.decimals}`);
    console.log(`   Total Supply: ${info.totalSupply}`);
    console.log(`   Treasury: ${info.treasuryAccountId}\n`);

    console.log('🎉 Test token deployed successfully!');
    console.log(`📝 Token ID: ${tokenId}\n`);

    closeClient();
  } catch (error: any) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

main();
