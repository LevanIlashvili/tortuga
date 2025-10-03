'use client';

import { useEffect, useState, useMemo } from 'react';
import { PropertyCard } from '../_components/property-card';
import { Filters } from './_components/filters';
import { Building2 } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  location: string;
  images: { url: string; isPrimary: boolean }[];
  tokenPrice: number;
  expectedApy: number;
  totalValue: number;
  availableTokens: number;
  totalTokens: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [minApy, setMinApy] = useState('all');
  const [location, setLocation] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties');
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      const data = await response.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (err) {
      setError('Failed to load properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const locations = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    return Array.from(new Set(properties.map((p) => p.location))).sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    return properties.filter((property) => {
      if (searchQuery && !property.name.toLowerCase().includes(searchQuery.toLowerCase()) && !property.location.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (minApy !== 'all' && property.expectedApy < parseFloat(minApy)) {
        return false;
      }

      if (location !== 'all' && property.location !== location) {
        return false;
      }

      return true;
    });
  }, [properties, searchQuery, minApy, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Explore Properties</h1>
            <p className="mt-2 text-gray-600">
              Browse available real estate investment opportunities
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Explore Properties</h1>
            <p className="mt-4 text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Properties</h1>
          <p className="mt-2 text-gray-600">
            Browse {properties?.length || 0} available real estate investment opportunities
          </p>
        </div>

        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          minApy={minApy}
          setMinApy={setMinApy}
          location={location}
          setLocation={setLocation}
          locations={locations}
        />

        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gray-100 p-8 mb-6">
              <Building2 className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {!properties || properties.length === 0
                ? 'No Properties Available'
                : 'No Matching Properties'}
            </h3>
            <p className="text-gray-600">
              {!properties || properties.length === 0
                ? 'Properties will appear here once they are listed.'
                : 'Try adjusting your filters to see more results.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
