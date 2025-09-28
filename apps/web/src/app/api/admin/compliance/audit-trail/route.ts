import { NextRequest } from 'next/server';
import { successResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getComplianceAuditTrail } from '@tortuga/hedera';

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAdminAuth();

  const { searchParams } = new URL(request.url);
  const eventType = searchParams.get('eventType');
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '50');

  const auditTrail = await getComplianceAuditTrail({
    eventType: eventType || undefined,
    userId: userId || undefined,
    limit,
  });

  return successResponse({
    auditTrail: auditTrail.map((entry) => ({
      consensusTimestamp: entry.consensusTimestamp,
      eventType: entry.eventType,
      data: entry.data,
      actor: entry.actor,
      transactionId: entry.transactionId,
    })),
    count: auditTrail.length,
  });
});
