import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth();

  const kycApplication = await prisma.kycApplication.findUnique({
    where: { userId: session.userId },
  });

  if (!kycApplication) {
    return successResponse({
      status: null,
      application: null,
      message: 'No KYC application found',
    });
  }

  return successResponse({
    status: kycApplication.status,
    application: {
      id: kycApplication.id,
      status: kycApplication.status,
      fullName: kycApplication.fullName,
      createdAt: kycApplication.createdAt,
      updatedAt: kycApplication.updatedAt,
      reviewedAt: kycApplication.reviewedAt,
      rejectionNote: kycApplication.rejectionNote,
    },
  });
});
