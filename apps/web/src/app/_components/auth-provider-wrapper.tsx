'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const AuthProvider = dynamic(
  () => import('./auth-provider').then((mod) => ({ default: mod.AuthProvider })),
  { ssr: false }
);

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
