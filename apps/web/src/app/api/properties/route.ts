import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const location = searchParams.get('location');

  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  } else {
    where.status = 'ACTIVE';
  }

  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    };
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        hederaToken: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.property.count({ where }),
  ]);

  return successResponse({
    properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
