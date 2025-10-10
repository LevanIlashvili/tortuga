import { NextResponse } from 'next/server';
import { prisma } from '@tortuga/database';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const kycStatus = searchParams.get('kycStatus') || '';

    const where: any = {};

    if (search) {
      where.email = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (kycStatus) {
      where.kycApplication = {
        status: kycStatus,
      };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        kycApplication: true,
        wallets: {
          select: { accountId: true },
          take: 1,
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Users fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
