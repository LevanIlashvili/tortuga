'use client';

import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export function HashPackConnector() {
  const { user, accountId, isConnecting, connect, disconnect } = useAuth();

  if (user && accountId) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Wallet className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-mono text-gray-700">
            {accountId.slice(0, 8)}...{accountId.slice(-6)}
          </span>
        </div>
        <Button variant="outline" onClick={disconnect} size="sm">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
