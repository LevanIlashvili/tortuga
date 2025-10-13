'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={reset}
              className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/90"
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
