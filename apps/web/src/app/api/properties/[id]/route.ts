import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      hederaToken: true,
      orders: {
        where: { status: 'COMPLETED' },
        select: {
          tokenQuantity: true,
        },
      },
    },
  });

  if (!property) {
    return errorResponse('Property not found', 404);
  }

  const totalTokensSold = property.orders.reduce(
    (sum, order) => sum + order.tokenQuantity,
    0
  );

  return successResponse({
    ...property,
    tokensSold: totalTokensSold,
  });
});
