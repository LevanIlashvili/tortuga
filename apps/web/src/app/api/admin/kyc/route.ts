import { NextResponse } from 'next/server';
import { prisma } from '@tortuga/database';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
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

    const { userId, action, note } = await request.json();

    if (!userId || !action || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    const kycApplication = await prisma.kycApplication.findUnique({
      where: { userId },
    });

    if (!kycApplication) {
      return NextResponse.json(
        { success: false, error: 'KYC application not found' },
        { status: 404 }
      );
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await prisma.kycApplication.update({
      where: { userId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        rejectionNote: action === 'REJECT' ? note : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `KYC application ${newStatus.toLowerCase()}`,
    });
  } catch (error) {
    console.error('KYC review failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
