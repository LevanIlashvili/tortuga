#!/usr/bin/env tsx

import { createComplianceTopic } from '@tortuga/hedera';

async function main() {
  console.log('🚀 Setting up Hedera infrastructure...\n');

  try {
    console.log('📋 Step 1: Creating HCS Compliance Topic...');
    const topicId = await createComplianceTopic('Tortuga Compliance Log - Production');
    console.log(`✅ Compliance topic created: ${topicId}\n`);

    console.log('🎉 Setup complete!\n');
    console.log('📝 Next steps:');
    console.log(`   1. Add HEDERA_COMPLIANCE_TOPIC_ID="${topicId}" to your .env file`);
    console.log('   2. Run: pnpm db:push (to create database tables)');
    console.log('   3. Run: pnpm db:seed (to seed sample data)');
    console.log('   4. Run: pnpm dev (to start development server)\n');
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
