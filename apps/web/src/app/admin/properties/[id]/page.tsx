'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Rocket, Check, AlertCircle } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl: string | null;
  totalValue: number;
  bondYield: number;
  maturityDate: string;
  minimumInvestment: number;
  tokenSupply: number;
  tokenPrice: number;
  tokensSold: number;
  status: string;
  hederaToken: {
    tokenId: string;
    tokenName: string;
    tokenSymbol: string;
    treasuryAccountId: string;
  } | null;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    imageUrl: '',
    totalValue: '',
    bondYield: '',
    maturityDate: '',
    minimumInvestment: '',
    tokenSupply: '',
    tokenPrice: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.property) {
          setProperty(data.property);
          setFormData({
            name: data.property.name,
            description: data.property.description,
            location: data.property.location,
            imageUrl: data.property.imageUrl || '',
            totalValue: String(data.property.totalValue),
            bondYield: String(data.property.bondYield),
            maturityDate: new Date(data.property.maturityDate).toISOString().split('T')[0],
            minimumInvestment: String(data.property.minimumInvestment),
            tokenSupply: String(data.property.tokenSupply),
            tokenPrice: String(data.property.tokenPrice),
            status: data.property.status,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalValue: parseFloat(formData.totalValue),
          bondYield: parseFloat(formData.bondYield),
          minimumInvestment: parseFloat(formData.minimumInvestment),
          tokenSupply: parseInt(formData.tokenSupply),
          tokenPrice: parseFloat(formData.tokenPrice),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProperty(data.property);
          alert('Property updated successfully');
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Property update failed:', error);
      alert('Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  const handleDeployToken = async () => {
    if (!confirm('Are you sure you want to deploy this token to Hedera? This action cannot be undone.')) {
      return;
    }

    setDeploying(true);
    setDeployError('');

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/deploy-token`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProperty(data.property);
          alert('Token deployed successfully!');
        }
      } else {
        const data = await response.json();
        setDeployError(data.error || 'Failed to deploy token');
        alert(data.error || 'Failed to deploy token');
      }
    } catch (error: any) {
      console.error('Token deployment failed:', error);
      setDeployError(error.message || 'Failed to deploy token');
      alert('Failed to deploy token');
    } finally {
      setDeploying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/properties');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Property deletion failed:', error);
      alert('Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/admin/properties')}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Properties
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="mt-2 text-gray-600">Update property details and manage token deployment</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Property Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location *
                    </label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL *
                    </label>
                    <Input
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      required
                      type="url"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Value (USD) *
                    </label>
                    <Input
                      name="totalValue"
                      value={formData.totalValue}
                      onChange={handleChange}
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bond Yield (%) *
                    </label>
                    <Input
                      name="bondYield"
                      value={formData.bondYield}
                      onChange={handleChange}
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Maturity Date *
                    </label>
                    <Input
                      name="maturityDate"
                      value={formData.maturityDate}
                      onChange={handleChange}
                      required
                      type="date"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Investment (USD) *
                    </label>
                    <Input
                      name="minimumInvestment"
                      value={formData.minimumInvestment}
                      onChange={handleChange}
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Token Supply *
                    </label>
                    <Input
                      name="tokenSupply"
                      value={formData.tokenSupply}
                      onChange={handleChange}
                      required
                      type="number"
                      min="1"
                      className="mt-2"
                      disabled={!!property.hederaToken}
                    />
                    {property.hederaToken && (
                      <p className="mt-1 text-xs text-gray-500">
                        Cannot change after token deployment
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Token Price (USD) *
                    </label>
                    <Input
                      name="tokenPrice"
                      value={formData.tokenPrice}
                      onChange={handleChange}
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="CLOSED">Closed</option>
                      <option value="SOLD_OUT">Sold Out</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving || property.tokensSold > 0}
                    className="rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Token Deployment</CardTitle>
            </CardHeader>
            <CardContent>
              {property.hederaToken ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Token Deployed</span>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Token ID</label>
                    <p className="mt-1 font-mono text-sm text-blue-600">
                      {property.hederaToken.tokenId}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Token Name</label>
                    <p className="mt-1 text-sm">{property.hederaToken.tokenName}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Token Symbol</label>
                    <p className="mt-1 text-sm">{property.hederaToken.tokenSymbol}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Treasury Account</label>
                    <p className="mt-1 font-mono text-xs text-gray-600">
                      {property.hederaToken.treasuryAccountId}
                    </p>
                  </div>

                  <a
                    href={`https://hashscan.io/mainnet/token/${property.hederaToken.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View on HashScan
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Deploy this property as a Hedera Token Service (HTS) token to enable trading.
                  </p>

                  {deployError && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
                      <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Deployment Failed</p>
                        <p className="mt-1 text-xs text-red-700">{deployError}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleDeployToken}
                    disabled={deploying}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {deploying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" />
                        Deploy Token
                      </>
                    )}
                  </button>

                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-xs text-blue-900">
                      <strong>Note:</strong> Once deployed, the token supply cannot be changed. Make
                      sure all details are correct before deploying.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
