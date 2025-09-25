import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { createKycApplicationSchema } from '@/lib/validations';
import { logToHCS } from '@/lib/hedera';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth();
  const body = await request.json();
  const validated = createKycApplicationSchema.parse(body);

  const existing = await prisma.kycApplication.findUnique({
    where: { userId: session.userId },
  });

  if (existing && existing.status === 'APPROVED') {
    return errorResponse('KYC already approved', 400);
  }

  if (existing && existing.status === 'PENDING') {
    return errorResponse('KYC application already submitted', 400);
  }

  const kycApplication = await prisma.kycApplication.upsert({
    where: { userId: session.userId },
    update: {
      status: 'PENDING',
      fullName: validated.fullName,
      dateOfBirth: new Date(validated.dateOfBirth),
      nationality: validated.nationality,
      address: validated.address,
      city: validated.city,
      postalCode: validated.postalCode,
      country: validated.country,
      idDocumentUrl: validated.idDocumentUrl,
      proofOfAddressUrl: validated.proofOfAddressUrl,
      selfieUrl: validated.selfieUrl,
      reviewedAt: null,
      reviewedBy: null,
      rejectionNote: null,
    },
    create: {
      userId: session.userId,
      status: 'PENDING',
      fullName: validated.fullName,
      dateOfBirth: new Date(validated.dateOfBirth),
      nationality: validated.nationality,
      address: validated.address,
      city: validated.city,
      postalCode: validated.postalCode,
      country: validated.country,
      idDocumentUrl: validated.idDocumentUrl,
      proofOfAddressUrl: validated.proofOfAddressUrl,
      selfieUrl: validated.selfieUrl,
    },
  });

  await logToHCS('KYC_SUBMITTED', {
    userId: session.userId,
    kycApplicationId: kycApplication.id,
    fullName: validated.fullName,
  }, session.userId);

  return successResponse({
    kycApplication: {
      id: kycApplication.id,
      status: kycApplication.status,
      createdAt: kycApplication.createdAt,
    },
    message: 'KYC application submitted successfully',
  }, 201);
});
