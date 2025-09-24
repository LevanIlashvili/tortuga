import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { createOrderSchema } from '@/lib/validations';
import { generateOrderMemo, getTreasuryAccount, logToHCS } from '@/lib/hedera';
import { USDC_TOKEN_ID } from '@tortuga/hedera';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth();
  const body = await request.json();
  const validated = createOrderSchema.parse(body);

  const property = await prisma.property.findUnique({
    where: { id: validated.propertyId },
  });

  if (!property) {
    return errorResponse('Property not found', 404);
  }

  if (property.status !== 'ACTIVE') {
    return errorResponse('Property is not available for purchase', 400);
  }

  const availableTokens = property.tokenSupply - property.tokensSold;
  if (validated.tokenQuantity > availableTokens) {
    return errorResponse(
      `Only ${availableTokens} tokens available`,
      400
    );
  }

  const totalAmount = property.tokenPrice * validated.tokenQuantity;
  const usdcAmount = totalAmount;

  const order = await prisma.order.create({
    data: {
      userId: session.userId,
      propertyId: validated.propertyId,
      orderNumber: `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING_PAYMENT',
      tokenQuantity: validated.tokenQuantity,
      tokenPrice: property.tokenPrice,
      totalAmount,
      usdcAmount,
      paymentMemo: '',
    },
  });

  const memo = generateOrderMemo(order.id);

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentMemo: memo },
  });

  await logToHCS('ORDER_CREATED', {
    orderId: order.id,
    userId: session.userId,
    propertyId: validated.propertyId,
    tokenQuantity: validated.tokenQuantity,
    totalAmount: totalAmount.toString(),
  }, session.userId);

  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet';
  const usdcTokenId = USDC_TOKEN_ID[network as keyof typeof USDC_TOKEN_ID];

  return successResponse({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      tokenQuantity: order.tokenQuantity,
      totalAmount: order.totalAmount,
      usdcAmount: order.usdcAmount,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    payment: {
      treasuryAccount: getTreasuryAccount(),
      memo: memo,
      amount: usdcAmount.toString(),
      tokenId: usdcTokenId,
      network,
    },
  }, 201);
});
