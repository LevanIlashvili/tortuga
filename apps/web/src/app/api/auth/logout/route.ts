import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
