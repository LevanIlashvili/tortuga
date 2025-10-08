'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Circle, Wallet } from 'lucide-react';
import { useAuth } from '@/app/_components/auth-provider';

interface PropertyToken {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  property: {
    id: string;
    name: string;
  };
  isAssociated: boolean;
}

export default function WalletSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tokens, setTokens] = useState<PropertyToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [associating, setAssociating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchTokens();
  }, [user]);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet/tokens');
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      const data = await response.json();
      if (data.success) {
        setTokens(data.tokens);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tokens');
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateAll = async () => {
    const tokensToAssociate = tokens.filter(t => !t.isAssociated);
    if (tokensToAssociate.length === 0) {
      return;
    }

    setAssociating(true);
    setError(null);

    try {
      // This will be implemented in the next commit with actual HashPack integration
      const response = await fetch('/api/wallet/associate-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenIds: tokensToAssociate.map(t => t.tokenId),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to associate tokens');
      }

      const data = await response.json();
      if (data.success) {
        await fetchTokens();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to associate tokens');
    } finally {
      setAssociating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Wallet Setup</h1>
            <p className="mt-2 text-gray-600">Associate tokens with your wallet</p>
          </div>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  const associatedCount = tokens.filter(t => t.isAssociated).length;
  const totalCount = tokens.length;
  const allAssociated = associatedCount === totalCount;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wallet Setup</h1>
          <p className="mt-2 text-gray-600">Associate property tokens with your wallet to receive and manage your investments</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <CardTitle>Token Association</CardTitle>
                <CardDescription>
                  On Hedera, you must associate tokens with your wallet before receiving them
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">What is Token Association?</h4>
              <p className="text-sm text-blue-700">
                Token association is a one-time setup that allows your wallet to receive specific tokens on Hedera.
                This is a security feature that prevents spam tokens from being sent to your wallet without your consent.
                You need to associate each property token before you can purchase it.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Association Progress</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {associatedCount} / {totalCount}
                </div>
              </div>
              {!allAssociated && (
                <Button
                  onClick={handleAssociateAll}
                  disabled={associating}
                  size="lg"
                >
                  {associating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Associating...
                    </>
                  ) : (
                    'Associate All Tokens'
                  )}
                </Button>
              )}
              {allAssociated && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  All Tokens Associated
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6 text-sm text-red-600">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Property Tokens</CardTitle>
            <CardDescription>Available tokens for association</CardDescription>
          </CardHeader>
          <CardContent>
            {tokens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No property tokens available yet
              </div>
            ) : (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div
                    key={token.tokenId}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {token.isAssociated ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{token.property.name}</div>
                        <div className="text-sm text-gray-600">
                          {token.tokenSymbol} • {token.tokenId}
                        </div>
                      </div>
                    </div>
                    {token.isAssociated ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Associated
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Not Associated
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {allAssociated && (
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={() => router.push('/properties')}>
              Continue to Properties
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
