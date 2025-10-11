import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logToHCS } from '@/lib/hedera';
import { z } from 'zod';

const updatePropertySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  totalValue: z.number().optional(),
  bondYield: z.number().optional(),
  maturityDate: z.string().optional(),
  minimumInvestment: z.number().optional(),
  tokenSupply: z.number().optional(),
  tokenPrice: z.number().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'SOLD_OUT']).optional(),
});

export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await requireAdminAuth();
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      hederaToken: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!property) {
    return errorResponse('Property not found', 404);
  }

  return successResponse({ property });
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireAdminAuth();
  const { id } = await params;
  const body = await request.json();
  const validated = updatePropertySchema.parse(body);

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    return errorResponse('Property not found', 404);
  }

  // Convert maturityDate to Date if present
  const updateData: any = { ...validated };
  if (validated.maturityDate) {
    updateData.maturityDate = new Date(validated.maturityDate);
  }

  const updatedProperty = await prisma.property.update({
    where: { id },
    data: updateData,
    include: {
      hederaToken: true,
    },
  });

  await logToHCS('PROPERTY_UPDATED', {
    propertyId: id,
    changes: validated,
  }, session.userId);

  return successResponse({
    property: updatedProperty,
    message: 'Property updated successfully',
  });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireAdminAuth();
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!property) {
    return errorResponse('Property not found', 404);
  }

  if (property._count.orders > 0) {
    return errorResponse('Cannot delete property with existing orders', 400);
  }

  await prisma.property.delete({
    where: { id },
  });

  await logToHCS('PROPERTY_DELETED', {
    propertyId: id,
    name: property.name,
  }, session.userId);

  return successResponse({
    message: 'Property deleted successfully',
  });
});
