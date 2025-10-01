import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, Clock } from 'lucide-react';

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    location: string;
    images: { url: string; isPrimary: boolean }[];
    tokenPrice: number;
    expectedApy: number;
    totalValue: number;
    availableTokens: number;
    totalTokens: number;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage = property.images.find((img) => img.isPrimary)?.url || property.images[0]?.url || '/placeholder-property.jpg';
  const availabilityPercent = (property.availableTokens / property.totalTokens) * 100;

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative h-48 w-full">
          <Image
            src={primaryImage}
            alt={property.name}
            fill
            className="object-cover"
          />
          {availabilityPercent < 20 && (
            <Badge className="absolute top-2 right-2 bg-red-500">
              Almost Sold Out
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {property.name}
          </h3>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <MapPin className="mr-1 h-4 w-4" />
            {property.location}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="mr-1 h-4 w-4" />
                Expected APY
              </div>
              <div className="mt-1 text-lg font-semibold text-primary">
                {property.expectedApy}%
              </div>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-1 h-4 w-4" />
                Min. Investment
              </div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                ${property.tokenPrice}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-gray-50 p-4">
          <div className="flex w-full items-center justify-between text-sm">
            <span className="text-gray-600">Total Value</span>
            <span className="font-semibold text-gray-900">
              ${property.totalValue.toLocaleString()}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
