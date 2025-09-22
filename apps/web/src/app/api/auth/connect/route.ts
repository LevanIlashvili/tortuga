import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@tortuga/database';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, publicKey } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    let wallet = await prisma.wallet.findUnique({
      where: { accountId },
      include: { user: true },
    });

    let user;

    if (!wallet) {
      user = await prisma.user.create({
        data: {
          email: `${accountId}@hedera.wallet`,
          role: 'INVESTOR',
          isActive: true,
          wallets: {
            create: {
              accountId,
              publicKey: publicKey || null,
            },
          },
        },
      });
    } else {
      user = wallet.user;
      if (publicKey && wallet.publicKey !== publicKey) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { publicKey },
        });
      }
    }

    await createSession({
      userId: user.id,
      accountId,
      role: user.role,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        accountId,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Auth connect error:', error);
    return NextResponse.json(
      { error: 'Failed to connect wallet' },
      { status: 500 }
    );
  }
}
