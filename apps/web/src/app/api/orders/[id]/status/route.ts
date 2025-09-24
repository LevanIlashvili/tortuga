import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { monitorTreasuryPayments } from '@tortuga/hedera';
import { getTreasuryAccount, logToHCS } from '@/lib/hedera';

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireAuth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      property: true,
      payment: true,
    },
  });

  if (!order) {
    return errorResponse('Order not found', 404);
  }

  if (order.userId !== session.userId) {
    return errorResponse('Unauthorized', 403);
  }

  if (order.status === 'COMPLETED' || order.status === 'TOKENS_MINTED') {
    return successResponse({
      order: {
        id: order.id,
        status: order.status,
        payment: order.payment,
      },
    });
  }

  if (order.status === 'PENDING_PAYMENT') {
    try {
      const treasuryAccount = getTreasuryAccount();
      const payments = await monitorTreasuryPayments(treasuryAccount);

      const matchingPayment = payments.find(
        (p) => p.memo === order.paymentMemo
      );

      if (matchingPayment) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.create({
            data: {
              orderId: order.id,
              status: 'CONFIRMED',
              amount: order.usdcAmount,
              currency: 'USDC',
              hederaTransactionId: matchingPayment.transactionId,
              hederaTreasuryId: treasuryAccount,
              hederaMemo: matchingPayment.memo,
              confirmedAt: new Date(matchingPayment.consensusTimestamp),
            },
          });

          await tx.order.update({
            where: { id: order.id },
            data: { status: 'PAYMENT_RECEIVED' },
          });
        });

        await logToHCS('PAYMENT_RECEIVED', {
          orderId: order.id,
          transactionId: matchingPayment.transactionId,
          amount: matchingPayment.amount,
        }, session.userId);

        return successResponse({
          order: {
            id: order.id,
            status: 'PAYMENT_RECEIVED',
            paymentDetected: true,
          },
        });
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  }

  return successResponse({
    order: {
      id: order.id,
      status: order.status,
      paymentDetected: false,
    },
  });
});
