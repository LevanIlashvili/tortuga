import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAdminAuth();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const kycStatus = searchParams.get('kycStatus');
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (kycStatus) {
    whereClause.kycStatus = kycStatus;
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        wallets: true,
        kycApplication: {
          select: {
            id: true,
            status: true,
            fullName: true,
            createdAt: true,
            updatedAt: true,
            reviewedAt: true,
            rejectionNote: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return successResponse({
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
      wallets: user.wallets,
      kycApplication: user.kycApplication,
      ordersCount: user._count.orders,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});
