'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function CreatePropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
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
        router.push('/admin/properties');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create property');
      }
    } catch (error) {
      console.error('Property creation failed:', error);
      alert('Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Properties
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Property</h1>
        <p className="mt-2 text-gray-600">Add a new real estate property to tokenize</p>
      </div>

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
                  placeholder="e.g., Luxury Apartment Complex"
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
                  placeholder="Describe the property, its features, and investment opportunity..."
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
                  placeholder="e.g., Dubai, UAE"
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
                  placeholder="https://example.com/image.jpg"
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
                  placeholder="5000000"
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
                  placeholder="8.5"
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
                  placeholder="1000"
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
                  placeholder="5000"
                  className="mt-2"
                />
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
                  placeholder="1000"
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
                disabled={loading}
                className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Property'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
