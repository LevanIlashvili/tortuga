'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Check, Clock, XCircle } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  location: string;
  totalValue: number;
  bondYield: number;
  tokenSupply: number;
  tokensSold: number;
  tokenPrice: number;
  status: string;
  createdAt: string;
  hederaToken: {
    tokenId: string;
    tokenName: string;
    tokenSymbol: string;
  } | null;
  _count: {
    orders: number;
  };
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/admin/properties');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProperties(data.properties);
        }
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; bg: string }> = {
      ACTIVE: { icon: Check, color: 'text-green-700', bg: 'bg-green-50' },
      DRAFT: { icon: Clock, color: 'text-gray-700', bg: 'bg-gray-100' },
      SOLD_OUT: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50' },
      CLOSED: { icon: XCircle, color: 'text-gray-700', bg: 'bg-gray-100' },
    };

    const badge = badges[status] || badges.DRAFT;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full ${badge.bg} px-3 py-1 text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="mt-2 text-gray-600">Manage real estate properties and tokens</p>
        </div>
        <button
          onClick={() => router.push('/admin/properties/create')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Property
        </button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="h-64 animate-pulse rounded bg-gray-200" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Properties ({properties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-500">
                    <th className="pb-3">Property</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Total Value</th>
                    <th className="pb-3">Bond Yield</th>
                    <th className="pb-3">Tokens</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Token ID</th>
                    <th className="pb-3">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-sm text-gray-500">
                        No properties found
                      </td>
                    </tr>
                  ) : (
                    properties.map((property) => (
                      <tr
                        key={property.id}
                        className="cursor-pointer border-b last:border-0 hover:bg-gray-50"
                        onClick={() => router.push(`/admin/properties/${property.id}`)}
                      >
                        <td className="py-4">
                          <div>
                            <p className="text-sm font-medium">{property.name}</p>
                            <p className="text-xs text-gray-500">
                              Created {new Date(property.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-600">{property.location}</td>
                        <td className="py-4 text-sm font-medium">
                          ${Number(property.totalValue).toLocaleString()}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {Number(property.bondYield)}%
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {property.tokensSold} / {property.tokenSupply}
                        </td>
                        <td className="py-4">{getStatusBadge(property.status)}</td>
                        <td className="py-4">
                          {property.hederaToken ? (
                            <div>
                              <p className="text-xs font-mono text-blue-600">
                                {property.hederaToken.tokenId}
                              </p>
                              <p className="text-xs text-gray-500">
                                {property.hederaToken.tokenSymbol}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not deployed</span>
                          )}
                        </td>
                        <td className="py-4 text-sm text-gray-600">{property._count.orders}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
