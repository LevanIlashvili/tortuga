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

    const properties = await prisma.property.findMany({
      include: {
        hederaToken: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error('Properties fetch failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();

    const property = await prisma.property.create({
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        imageUrl: body.imageUrl,
        totalValue: body.totalValue,
        bondYield: body.bondYield,
        maturityDate: new Date(body.maturityDate),
        minimumInvestment: body.minimumInvestment,
        tokenSupply: body.tokenSupply,
        tokenPrice: body.tokenPrice,
        status: body.status || 'DRAFT',
      },
    });

    return NextResponse.json({
      success: true,
      property,
      message: 'Property created successfully',
    });
  } catch (error) {
    console.error('Property creation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
