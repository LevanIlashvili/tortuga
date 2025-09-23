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
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });

  if (!property) {
    return errorResponse('Property not found', 404);
  }

  const images = property.imageUrl ? [property.imageUrl] : [];

  return successResponse({
    propertyId: property.id,
    propertyName: property.name,
    images,
    count: images.length,
    thumbnail: images[0] || null,
  });
});
