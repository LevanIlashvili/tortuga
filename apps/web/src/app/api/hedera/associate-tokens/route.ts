import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth();

  const orders = await prisma.order.findMany({
    where: {
      userId: session.userId,
      status: {
        in: ['PAYMENT_RECEIVED', 'TOKENS_MINTED', 'COMPLETED'],
      },
    },
    include: {
      property: {
        include: {
          hederaToken: true,
        },
      },
    },
    distinct: ['propertyId'],
  });

  const tokensToAssociate = orders
    .filter((order) => order.property.hederaToken)
    .map((order) => ({
      tokenId: order.property.hederaToken!.tokenId,
      tokenName: order.property.hederaToken!.tokenName,
      tokenSymbol: order.property.hederaToken!.tokenSymbol,
      propertyId: order.property.id,
      propertyName: order.property.name,
    }));

  return successResponse({
    tokens: tokensToAssociate,
    count: tokensToAssociate.length,
  });
});
