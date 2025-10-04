'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, Clock, Building2 } from 'lucide-react';
import { ImageGallery } from './_components/image-gallery';
import { PurchaseModal } from './_components/purchase-modal';
import { useAuth } from '@/app/_components/auth-provider';

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  propertyType: string;
  images: { url: string; isPrimary: boolean }[];
  tokenPrice: number;
  expectedApy: number;
  totalValue: number;
  availableTokens: number;
  totalTokens: number;
  hederaToken?: {
    tokenId: string;
    tokenName: string;
    tokenSymbol: string;
  };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, connect } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProperty(params.id as string);
    }
  }, [params.id]);

  const fetchProperty = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Property not found');
        }
        throw new Error('Failed to fetch property');
      }
      const data = await response.json();
      if (data.success) {
        setProperty(data.property);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load property');
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-96 w-full rounded-lg bg-gray-200" />
            <div className="mt-8 h-8 w-2/3 rounded bg-gray-200" />
            <div className="mt-4 h-4 w-1/3 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Property Not Found</h1>
            <p className="mt-4 text-gray-600">{error || 'This property does not exist.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const availabilityPercent = (property.availableTokens / property.totalTokens) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ImageGallery images={property.images} propertyName={property.name} />

            <div className="mt-8">
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <div className="mt-4 flex items-center gap-6 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {property.location}
                </div>
                <div className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  {property.propertyType}
                </div>
              </div>
              <p className="mt-6 text-gray-700">{property.description}</p>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Investment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600">Total Value</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">
                      ${property.totalValue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Expected APY</div>
                    <div className="mt-1 text-2xl font-bold text-primary">
                      {property.expectedApy}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Token Price</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">
                      ${property.tokenPrice}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Available Tokens</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">
                      {property.availableTokens.toLocaleString()} / {property.totalTokens.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Invest Now</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Minimum Investment</div>
                    <div className="mt-1 text-3xl font-bold text-gray-900">${property.tokenPrice}</div>
                  </div>
                  {!user ? (
                    <Button className="w-full" size="lg" onClick={connect}>
                      Connect Wallet
                    </Button>
                  ) : user.kycStatus === 'PENDING' ? (
                    <Button className="w-full" size="lg" disabled>
                      KYC Under Review
                    </Button>
                  ) : user.kycStatus === 'REJECTED' ? (
                    <Button className="w-full" size="lg" onClick={() => router.push('/kyc')}>
                      Complete KYC
                    </Button>
                  ) : user.kycStatus !== 'APPROVED' ? (
                    <Button className="w-full" size="lg" onClick={() => router.push('/kyc')}>
                      Complete KYC
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" onClick={() => setPurchaseModalOpen(true)}>
                      Invest Now
                    </Button>
                  )}
                  {property.hederaToken && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="text-xs text-gray-600">Token ID</div>
                      <div className="mt-1 font-mono text-sm text-gray-900">{property.hederaToken.tokenId}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {property && (
        <PurchaseModal
          open={purchaseModalOpen}
          onOpenChange={setPurchaseModalOpen}
          property={{
            id: property.id,
            name: property.name,
            tokenPrice: property.tokenPrice,
            availableTokens: property.availableTokens,
          }}
        />
      )}
    </div>
  );
}
