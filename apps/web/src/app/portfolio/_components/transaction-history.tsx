'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowUpDown } from 'lucide-react';

interface Transaction {
  id: string;
  createdAt: string;
  property: {
    name: string;
    id: string;
  };
  tokensAmount: number;
  totalAmount: number;
  status: string;
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'createdAt' | 'totalAmount'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/my-orders');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransactions(data.orders);
        }
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Payment</Badge>;
      case 'PAYMENT_RECEIVED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Payment Received</Badge>;
      case 'TOKENS_MINTED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Tokens Minted</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSort = (field: 'createdAt' | 'totalAmount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue = sortField === 'createdAt' ? new Date(a.createdAt).getTime() : a.totalAmount;
    let bValue = sortField === 'createdAt' ? new Date(b.createdAt).getTime() : b.totalAmount;

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Property
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Tokens
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    <button
                      onClick={() => handleSort('totalAmount')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Amount
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.property.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.tokensAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      ${transaction.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {getStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
