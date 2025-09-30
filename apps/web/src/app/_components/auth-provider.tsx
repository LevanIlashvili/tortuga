'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string | null;
  role: string;
  kycStatus: string;
  accountId?: string;
}

interface AuthContextType {
  user: User | null;
  accountId: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setAccountId(data.user.accountId);
        }
      }
    } catch (error) {
      console.error('Failed to check session:', error);
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      const accountId = '0.0.1234567';
      const publicKey = 'mock-public-key';

      const response = await fetch('/api/auth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, publicKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect');
      }

      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        setAccountId(accountId);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setAccountId(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accountId,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
