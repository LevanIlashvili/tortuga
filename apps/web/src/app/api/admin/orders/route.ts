import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAdminAuth();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (status) {
    whereClause.status = status;
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            kycApplication: {
              select: {
                status: true,
              },
            },
            wallets: {
              select: {
                accountId: true,
              },
            },
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            hederaToken: {
              select: {
                tokenId: true,
                tokenName: true,
                tokenSymbol: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: whereClause }),
  ]);

  return successResponse({
    orders,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});
