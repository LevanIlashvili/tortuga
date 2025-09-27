import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logToHCS } from '@/lib/hedera';
import { z } from 'zod';

const rejectSchema = z.object({
  kycApplicationId: z.string(),
  rejectionNote: z.string().min(10),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAdminAuth();
  const body = await request.json();
  const validated = rejectSchema.parse(body);

  const kycApplication = await prisma.kycApplication.findUnique({
    where: { id: validated.kycApplicationId },
    include: { user: true },
  });

  if (!kycApplication) {
    return errorResponse('KYC application not found', 404);
  }

  if (kycApplication.status === 'APPROVED') {
    return errorResponse('Cannot reject approved KYC', 400);
  }

  await prisma.$transaction([
    prisma.kycApplication.update({
      where: { id: validated.kycApplicationId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: session.userId,
        rejectionNote: validated.rejectionNote,
      },
    }),
    prisma.user.update({
      where: { id: kycApplication.userId },
      data: { kycStatus: 'REJECTED' },
    }),
  ]);

  await logToHCS('KYC_REJECTED', {
    kycApplicationId: validated.kycApplicationId,
    userId: kycApplication.userId,
    reviewedBy: session.userId,
    rejectionNote: validated.rejectionNote,
  }, session.userId);

  return successResponse({
    message: 'KYC application rejected',
    kycApplication: {
      id: kycApplication.id,
      status: 'REJECTED',
      rejectionNote: validated.rejectionNote,
    },
  });
});
