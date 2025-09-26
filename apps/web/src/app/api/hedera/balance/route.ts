import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { getAccountBalance } from '@tortuga/hedera';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth();
  const { searchParams } = new URL(request.url);

  const accountId = searchParams.get('accountId') || session.accountId;

  if (session.role !== 'ADMIN' && accountId !== session.accountId) {
    return errorResponse('Unauthorized to view this account', 403);
  }

  const balance = await getAccountBalance(accountId);

  return successResponse({
    accountId,
    hbar: balance.hbar,
    tokens: balance.tokens,
  });
});
