import { Loader2 } from 'lucide-react';

export default function PortfolioLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-6 w-64 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}
