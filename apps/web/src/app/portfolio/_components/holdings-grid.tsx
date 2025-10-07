'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface Holding {
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
}

interface HoldingsGridProps {
  holdings: Holding[];
}

export function HoldingsGrid({ holdings }: HoldingsGridProps) {
  const router = useRouter();

  if (holdings.length === 0) {
    return (
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
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Holdings</h2>
      <div className="grid grid-cols-1 gap-6">
        {holdings.map((holding) => {
          const primaryImage = holding.property.images.find((img) => img.isPrimary)?.url || holding.property.images[0]?.url;
          return (
            <Card
              key={holding.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/properties/${holding.property.id}`)}
            >
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
  );
}
