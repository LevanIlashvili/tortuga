'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet, Building2 } from 'lucide-react';

interface PortfolioStatsProps {
  totalValue: number;
  totalInvested: number;
  totalReturns: number;
  propertiesCount: number;
}

export function PortfolioStats({ totalValue, totalInvested, totalReturns, propertiesCount }: PortfolioStatsProps) {
  const totalReturnPercentage = totalInvested > 0
    ? ((totalReturns / totalInvested) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          <Wallet className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            ${totalValue.toLocaleString()}
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
            ${totalInvested.toLocaleString()}
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
            ${totalReturns.toLocaleString()}
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
            {propertiesCount}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Properties owned
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
