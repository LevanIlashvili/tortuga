import { prisma } from '@tortuga/database';
import { verifyPaymentAndMintTokens } from '@tortuga/hedera';

const POLL_INTERVAL = 5000; // 5 seconds
const TREASURY_ACCOUNT_ID = process.env.HEDERA_TREASURY_ACCOUNT_ID!;

async function monitorPayments() {
  console.log(`[${new Date().toISOString()}] Starting payment monitoring service...`);
  console.log(`Treasury Account: ${TREASURY_ACCOUNT_ID}`);
  console.log(`Poll Interval: ${POLL_INTERVAL}ms`);

  while (true) {
    try {
      // Fetch all pending orders
      const pendingOrders = await prisma.order.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          user: {
            include: {
              wallets: true,
            },
          },
          property: {
            include: {
              hederaToken: true,
            },
          },
        },
      });

      if (pendingOrders.length > 0) {
        console.log(`[${new Date().toISOString()}] Found ${pendingOrders.length} pending orders`);
      }

      // Check each pending order for payment
      for (const order of pendingOrders) {
        try {
          if (!order.property.hederaToken) {
            console.log(`[${new Date().toISOString()}] Order ${order.id}: Property token not deployed yet`);
            continue;
          }

          const userWallet = order.user.wallets[0]?.accountId;
          if (!userWallet) {
            console.log(`[${new Date().toISOString()}] Order ${order.id}: User has no wallet`);
            continue;
          }

          console.log(`[${new Date().toISOString()}] Checking order ${order.id}...`);
          console.log(`  - User: ${order.user.email}`);
          console.log(`  - Wallet: ${userWallet}`);
          console.log(`  - Memo: ${order.paymentMemo}`);
          console.log(`  - Amount: ${order.totalAmount} USD`);

          // Verify payment and mint tokens
          const result = await verifyPaymentAndMintTokens({
            orderId: order.id,
            userAccountId: userWallet,
            expectedMemo: order.paymentMemo,
            tokenId: order.property.hederaToken.tokenId,
            tokenAmount: order.tokenAmount,
          });

          if (result.success) {
            console.log(`[${new Date().toISOString()}] ✓ Order ${order.id} completed successfully!`);
            console.log(`  - Payment TX: ${result.paymentTransactionId}`);
            console.log(`  - Mint TX: ${result.mintTransactionId}`);
          }
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] Error processing order ${order.id}:`, error.message);

          // Mark order as failed if it's been pending too long (24 hours)
          const hoursSinceCreation = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
          if (hoursSinceCreation > 24) {
            console.log(`[${new Date().toISOString()}] Order ${order.id} expired (>24h), marking as failed`);
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'FAILED',
                failureReason: 'Payment timeout - no payment received within 24 hours',
              },
            });
          }
        }
      }
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Monitor loop error:`, error.message);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n[${new Date().toISOString()}] Shutting down payment monitoring service...`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`\n[${new Date().toISOString()}] Shutting down payment monitoring service...`);
  process.exit(0);
});

// Start monitoring
monitorPayments().catch((error) => {
  console.error(`[${new Date().toISOString()}] Fatal error:`, error);
  process.exit(1);
});
