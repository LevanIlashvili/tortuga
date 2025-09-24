import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireAuth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          hederaToken: true,
        },
      },
      payment: true,
      user: {
        select: {
          id: true,
          email: true,
          wallets: true,
        },
      },
    },
  });

  if (!order) {
    return errorResponse('Order not found', 404);
  }

  if (order.userId !== session.userId && session.role !== 'ADMIN') {
    return errorResponse('Unauthorized', 403);
  }

  return successResponse({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      tokenQuantity: order.tokenQuantity,
      tokenPrice: order.tokenPrice,
      totalAmount: order.totalAmount,
      usdcAmount: order.usdcAmount,
      paymentMemo: order.paymentMemo,
      completedAt: order.completedAt,
      hederaTokenMintTx: order.hederaTokenMintTx,
      createdAt: order.createdAt,
      property: {
        id: order.property.id,
        name: order.property.name,
        location: order.property.location,
        imageUrl: order.property.imageUrl,
        tokenSymbol: order.property.hederaToken?.tokenSymbol,
        tokenId: order.property.hederaToken?.tokenId,
      },
      payment: order.payment,
      user: session.role === 'ADMIN' ? order.user : undefined,
    },
  });
});
