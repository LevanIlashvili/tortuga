'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, CheckCircle2, Clock } from 'lucide-react';

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
  const router = useRouter();
  const [tokens, setTokens] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const totalAmount = (parseFloat(tokens) || 0) * property.tokenPrice;
  const tokensNum = parseFloat(tokens) || 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (order && orderStatus !== 'PAYMENT_RECEIVED' && orderStatus !== 'TOKENS_MINTED' && orderStatus !== 'COMPLETED') {
      interval = setInterval(() => {
        checkOrderStatus();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [order, orderStatus]);

  const checkOrderStatus = async () => {
    if (!order) return;

    try {
      const response = await fetch(`/api/orders/${order.order.id}/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrderStatus(data.order.status);
          if (data.order.status === 'COMPLETED') {
            setTimeout(() => {
              onOpenChange(false);
              router.push('/portfolio');
            }, 2000);
          }
        }
      }
    } catch (err) {
      console.error('Failed to check order status:', err);
    }
  };

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
        setOrder(data);
        setOrderStatus(data.order.status);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetModal = () => {
    setOrder(null);
    setOrderStatus(null);
    setTokens('1');
    setError(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="mr-1 h-3 w-3" />Awaiting Payment</Badge>;
      case 'PAYMENT_RECEIVED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="mr-1 h-3 w-3" />Payment Received</Badge>;
      case 'TOKENS_MINTED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="mr-1 h-3 w-3" />Tokens Minted</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetModal();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {property.name}</DialogTitle>
          <DialogDescription>
            {order ? 'Complete your payment to finalize the purchase' : 'Purchase property tokens to own a fraction of this real estate'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {!order ? (
            <>
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
            </>
          ) : (
            <>
              <div className="rounded-lg border bg-blue-50 border-blue-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-900">Order Status</span>
                  {orderStatus && getStatusBadge(orderStatus)}
                </div>
                <div className="text-xs text-blue-700">Order ID: {order.order.id}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-600">Treasury Account</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm font-mono">
                      {order.paymentDetails.treasuryAccount}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(order.paymentDetails.treasuryAccount)}
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Payment Amount</Label>
                  <div className="mt-1 rounded bg-gray-100 px-3 py-2">
                    <span className="text-lg font-bold">{order.paymentDetails.hbarAmount} HBAR</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Payment Memo (Required)</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm font-mono">
                      {order.paymentDetails.memo}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(order.paymentDetails.memo)}
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-sm font-semibold mb-2">Payment Instructions</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Open your HashPack wallet</li>
                  <li>Send <strong>{order.paymentDetails.hbarAmount} HBAR</strong> to the treasury account</li>
                  <li>Include the payment memo in the transaction</li>
                  <li>Wait for payment confirmation (this happens automatically)</li>
                </ol>
              </div>

              {orderStatus === 'COMPLETED' && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 className="inline mr-2 h-4 w-4" />
                  Purchase complete! Redirecting to portfolio...
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  resetModal();
                  onOpenChange(false);
                }}
                className="w-full"
              >
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
