import { NextResponse } from 'next/server';
import { prisma } from '@tortuga/database';
import { cookies } from 'next/headers';

export async function GET() {
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

    const [totalProperties, totalOrders, totalUsers, orders] = await Promise.all([
      prisma.property.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        where: { status: 'COMPLETED' },
        select: { usdcAmount: true },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.usdcAmount), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalProperties,
        totalOrders,
        totalUsers,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Stats fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
