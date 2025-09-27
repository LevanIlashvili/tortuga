import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, errorResponse, withErrorHandling, rateLimit } from '@/lib/api-utils';
import { createAdminSession, verifyPassword } from '@/lib/admin-auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const validated = loginSchema.parse(body);

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
    return errorResponse('Too many login attempts. Please try again later.', 429);
  }

  const user = await prisma.user.findUnique({
    where: { email: validated.email },
    include: {
      wallets: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });

  if (!user || user.role !== 'ADMIN') {
    return errorResponse('Invalid credentials', 401);
  }

  if (!user.passwordHash) {
    return errorResponse('Invalid credentials', 401);
  }

  const isValidPassword = await verifyPassword(validated.password, user.passwordHash);

  if (!isValidPassword) {
    return errorResponse('Invalid credentials', 401);
  }

  await createAdminSession({
    userId: user.id,
    email: user.email!,
    role: user.role,
    accountId: user.wallets[0]?.accountId,
  });

  return successResponse({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    },
  });
});
