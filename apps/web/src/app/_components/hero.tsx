import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Tokenize Real Estate on Hedera
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Invest in fractional real estate bonds backed by physical properties.
            Powered by Hedera Token Service for secure, compliant tokenization with
            immutable audit trails on Hedera Consensus Service.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/properties">
              <Button size="lg" className="gap-2">
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/kyc">
              <Button variant="outline" size="lg">
                Get Verified
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-primary">$2.5M+</div>
              <div className="mt-2 text-sm text-gray-600">Total Value Locked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">12</div>
              <div className="mt-2 text-sm text-gray-600">Properties Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">450+</div>
              <div className="mt-2 text-sm text-gray-600">Active Investors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
