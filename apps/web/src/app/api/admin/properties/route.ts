import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { createPropertySchema } from '@/lib/validations';
import { logToHCS } from '@/lib/hedera';

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAdminAuth();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const [properties, totalCount] = await Promise.all([
    prisma.property.findMany({
      include: {
        images: true,
        hederaToken: true,
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
    prisma.property.count(),
  ]);

  return successResponse({
    properties,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAdminAuth();
  const body = await request.json();
  const validated = createPropertySchema.parse(body);

  const property = await prisma.property.create({
    data: {
      name: validated.name,
      description: validated.description,
      location: validated.location,
      propertyType: validated.propertyType,
      totalValue: validated.totalValue,
      tokenPrice: validated.tokenPrice,
      totalTokens: validated.totalTokens,
      availableTokens: validated.availableTokens || validated.totalTokens,
      expectedApy: validated.expectedApy,
      images: {
        create: validated.images?.map((img: any) => ({
          url: img.url,
          isPrimary: img.isPrimary || false,
        })),
      },
    },
    include: {
      images: true,
    },
  });

  await logToHCS('PROPERTY_CREATED', {
    propertyId: property.id,
    name: property.name,
    totalValue: property.totalValue,
  }, session.userId);

  return successResponse(
    {
      property,
      message: 'Property created successfully',
    },
    201
  );
});
