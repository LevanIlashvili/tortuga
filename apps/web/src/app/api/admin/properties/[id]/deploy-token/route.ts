import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logToHCS } from '@/lib/hedera';
import { createPropertyToken } from '@tortuga/hedera';

export const POST = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireAdminAuth();
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: { hederaToken: true },
  });

  if (!property) {
    return errorResponse('Property not found', 404);
  }

  if (property.hederaToken) {
    return errorResponse('Token already deployed for this property', 400);
  }

  try {
    const tokenSymbol = property.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8);

    const tokenResult = await createPropertyToken({
      tokenName: `${property.name} Token`,
      tokenSymbol: tokenSymbol || 'PROP',
      initialSupply: property.tokenSupply,
    });

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        hederaToken: {
          create: {
            tokenId: tokenResult.tokenId,
            tokenName: tokenResult.tokenName,
            tokenSymbol: tokenResult.tokenSymbol,
            totalSupply: property.tokenSupply,
            decimals: 0,
            treasuryAccountId: tokenResult.treasuryAccountId,
          },
        },
      },
      include: {
        hederaToken: true,
      },
    });

    await logToHCS('TOKEN_DEPLOYED', {
      propertyId: id,
      tokenId: tokenResult.tokenId,
      tokenName: tokenResult.tokenName,
      tokenSymbol: tokenResult.tokenSymbol,
      totalSupply: property.tokenSupply,
    }, session.userId);

    return successResponse({
      property: updatedProperty,
      message: 'Token deployed successfully',
    });
  } catch (error: any) {
    throw error;
  }
});
