'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  minApy: string;
  setMinApy: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  locations: string[];
}

export function Filters({
  searchQuery,
  setSearchQuery,
  minApy,
  setMinApy,
  location,
  setLocation,
  locations,
}: FiltersProps) {
  return (
    <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="apy">Minimum APY</Label>
          <Select value={minApy} onValueChange={setMinApy}>
            <SelectTrigger id="apy" className="mt-2">
              <SelectValue placeholder="Any APY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any APY</SelectItem>
              <SelectItem value="5">5% or more</SelectItem>
              <SelectItem value="7">7% or more</SelectItem>
              <SelectItem value="10">10% or more</SelectItem>
              <SelectItem value="12">12% or more</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger id="location" className="mt-2">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
