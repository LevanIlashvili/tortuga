'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: string;
    name: string;
    tokenPrice: number;
    availableTokens: number;
  };
}

export function PurchaseModal({ open, onOpenChange, property }: PurchaseModalProps) {
  const [tokens, setTokens] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = (parseFloat(tokens) || 0) * property.tokenPrice;
  const tokensNum = parseFloat(tokens) || 0;

  const handlePurchase = async () => {
    if (tokensNum <= 0 || tokensNum > property.availableTokens) {
      setError('Invalid token amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          tokensAmount: tokensNum,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      if (data.success) {
        onOpenChange(false);
        window.location.href = `/orders/${data.order.id}`;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {property.name}</DialogTitle>
          <DialogDescription>
            Purchase property tokens to own a fraction of this real estate
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label htmlFor="tokens">Number of Tokens</Label>
            <Input
              id="tokens"
              type="number"
              min="1"
              max={property.availableTokens}
              value={tokens}
              onChange={(e) => setTokens(e.target.value)}
              className="mt-2"
            />
            <p className="mt-2 text-sm text-gray-600">
              Max available: {property.availableTokens.toLocaleString()} tokens
            </p>
          </div>

          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Price per token</span>
              <span className="font-semibold">${property.tokenPrice}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Tokens</span>
              <span className="font-semibold">{tokensNum.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-semibold">Total Amount</span>
              <span className="text-lg font-bold text-primary">
                ${totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={loading || tokensNum <= 0 || tokensNum > property.availableTokens}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
