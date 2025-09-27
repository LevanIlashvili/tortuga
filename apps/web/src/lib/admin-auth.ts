import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@tortuga/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface AdminSessionPayload {
  userId: string;
  email: string;
  role: string;
  accountId?: string;
}

export async function createAdminSession(payload: AdminSessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return token;
}

export async function verifyAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-session')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSessionPayload;
  } catch (error) {
    return null;
  }
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
}

export async function requireAdminAuth(): Promise<AdminSessionPayload> {
  const session = await verifyAdminSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (session.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
