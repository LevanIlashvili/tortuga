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
  hashconnect: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hashconnect, setHashconnect] = useState<any>(null);

  useEffect(() => {
    checkSession();
    initializeHashConnect();
  }, []);

  const initializeHashConnect = async () => {
    if (typeof window === 'undefined') return;

    try {
      const { HashConnect } = await import('hashconnect');
      const { LedgerId } = await import('@hashgraph/sdk');

      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

      const appMetadata = {
        name: 'Tortuga',
        description: 'Real Estate Tokenization Platform',
        icons: ['https://tortuga.app/icon.png'],
        url: typeof window !== 'undefined' ? window.location.origin : 'https://tortuga.app',
      };

      const hc = new HashConnect(
        LedgerId.MAINNET,
        projectId,
        appMetadata,
        true
      );

      hc.pairingEvent.on(async (pairingData) => {
        const connectedAccountId = pairingData.accountIds[0];
        if (connectedAccountId) {
          setAccountId(connectedAccountId);

          try {
            const response = await fetch('/api/auth/connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accountId: connectedAccountId,
                publicKey: '',
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                setUser(data.user);
              }
            }
          } catch (error) {
            console.error('Failed to create session:', error);
          } finally {
            setIsConnecting(false);
          }
        }
      });

      hc.disconnectionEvent.on(() => {
        setAccountId(null);
        setUser(null);
      });

      await hc.init();
      setHashconnect(hc);
    } catch (error) {
      console.error('Failed to initialize HashConnect:', error);
    }
  };

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (data.user.accountId) {
            setAccountId(data.user.accountId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check session:', error);
    }
  };

  const connect = async () => {
    if (!hashconnect) {
      alert('HashConnect not initialized. Please refresh the page.');
      return;
    }

    setIsConnecting(true);
    try {
      hashconnect.openPairingModal();
    } catch (error) {
      console.error('Failed to connect:', error);
      setIsConnecting(false);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      if (hashconnect) {
        hashconnect.disconnect();
      }

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
        hashconnect,
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
