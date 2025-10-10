import { NextResponse } from 'next/server';
import { prisma } from '@tortuga/database';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Try JWT-based session first
    const jwtSession = await verifySession();

    if (jwtSession) {
      const user = await prisma.user.findUnique({
        where: { id: jwtSession.userId },
        include: {
          wallets: true,
          kycApplication: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          wallets: user.wallets,
          kycStatus: user.kycApplication?.status || null,
          createdAt: user.createdAt,
        },
      });
    }

    // Try database session for admin
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: { include: { wallets: true, kycApplication: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        isActive: session.user.isActive,
        wallets: session.user.wallets,
        kycStatus: session.user.kycApplication?.status || null,
        createdAt: session.user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}
