'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Wallet, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/_components/auth-provider';
import { TransactionHistory } from './_components/transaction-history';

interface PortfolioData {
  totalValue: number;
  totalInvested: number;
  totalReturns: number;
  propertiesCount: number;
  holdings: Array<{
    id: string;
    property: {
      id: string;
      name: string;
      location: string;
      images: { url: string; isPrimary: boolean }[];
    };
    tokensOwned: number;
    currentValue: number;
    investedAmount: number;
    returnPercentage: number;
  }>;
}

export default function PortfolioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchPortfolio();
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/portfolio');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      const data = await response.json();
      if (data.success) {
        setPortfolio(data.portfolio);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio');
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
            <p className="mt-2 text-gray-600">Track your real estate investments</p>
          </div>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
            <p className="mt-2 text-gray-600">Track your real estate investments</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                {error || 'Failed to load portfolio'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalReturnPercentage = portfolio.totalInvested > 0
    ? ((portfolio.totalReturns / portfolio.totalInvested) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
          <p className="mt-2 text-gray-600">Track your real estate investments</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              <Wallet className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${portfolio.totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Current portfolio value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${portfolio.totalInvested.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Total amount invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${portfolio.totalReturns.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {totalReturnPercentage}% return
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Properties</CardTitle>
              <Building2 className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {portfolio.propertiesCount}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Properties owned
              </p>
            </CardContent>
          </Card>
        </div>

        {portfolio.holdings.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <Building2 className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Investments Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start building your real estate portfolio by investing in properties
                </p>
                <button
                  onClick={() => router.push('/properties')}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Browse Properties
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Holdings</h2>
            <div className="grid grid-cols-1 gap-6">
              {portfolio.holdings.map((holding) => {
                const primaryImage = holding.property.images.find((img) => img.isPrimary)?.url || holding.property.images[0]?.url;
                return (
                  <Card key={holding.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push(`/properties/${holding.property.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {primaryImage && (
                          <img
                            src={primaryImage}
                            alt={holding.property.name}
                            className="w-full sm:w-48 h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{holding.property.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{holding.property.location}</p>
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <div className="text-xs text-gray-600">Tokens Owned</div>
                              <div className="text-sm font-semibold text-gray-900">{holding.tokensOwned.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Current Value</div>
                              <div className="text-sm font-semibold text-gray-900">${holding.currentValue.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Invested</div>
                              <div className="text-sm font-semibold text-gray-900">${holding.investedAmount.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Return</div>
                              <div className={`text-sm font-semibold ${holding.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {holding.returnPercentage >= 0 ? '+' : ''}{holding.returnPercentage.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}
