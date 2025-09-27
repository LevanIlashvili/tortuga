import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logToHCS } from '@/lib/hedera';
import { z } from 'zod';

const approveSchema = z.object({
  kycApplicationId: z.string(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAdminAuth();
  const body = await request.json();
  const validated = approveSchema.parse(body);

  const kycApplication = await prisma.kycApplication.findUnique({
    where: { id: validated.kycApplicationId },
    include: { user: true },
  });

  if (!kycApplication) {
    return errorResponse('KYC application not found', 404);
  }

  if (kycApplication.status === 'APPROVED') {
    return errorResponse('KYC already approved', 400);
  }

  await prisma.$transaction([
    prisma.kycApplication.update({
      where: { id: validated.kycApplicationId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: session.userId,
        rejectionNote: null,
      },
    }),
    prisma.user.update({
      where: { id: kycApplication.userId },
      data: { kycStatus: 'APPROVED' },
    }),
  ]);

  await logToHCS('KYC_APPROVED', {
    kycApplicationId: validated.kycApplicationId,
    userId: kycApplication.userId,
    reviewedBy: session.userId,
  }, session.userId);

  return successResponse({
    message: 'KYC application approved',
    kycApplication: {
      id: kycApplication.id,
      status: 'APPROVED',
    },
  });
});
