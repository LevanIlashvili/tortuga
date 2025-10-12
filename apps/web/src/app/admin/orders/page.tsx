'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  tokenAmount: number;
  totalAmount: number;
  hbarAmount: number | null;
  usdAmount: number | null;
  paymentMemo: string;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    kycApplication: {
      status: string;
    } | null;
    wallets: Array<{
      accountId: string;
    }>;
  };
  property: {
    id: string;
    name: string;
    hederaToken: {
      tokenId: string;
      tokenName: string;
      tokenSymbol: string;
    } | null;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', String(currentPage));
      params.append('limit', '20');

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; bg: string }> = {
      PENDING: { icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-50' },
      PAID: { icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-50' },
      COMPLETED: { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
      FAILED: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50' },
      CANCELLED: { icon: XCircle, color: 'text-gray-700', bg: 'bg-gray-100' },
    };

    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full ${badge.bg} px-3 py-1 text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-gray-600">Manage and track all bond purchase orders</p>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>All Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-gray-500">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">User</th>
                      <th className="pb-3">Property</th>
                      <th className="pb-3">Token Amount</th>
                      <th className="pb-3">Total (USD)</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Payment Memo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-sm text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-4">
                            <p className="font-mono text-xs text-gray-600">
                              {order.id.slice(0, 8)}...
                            </p>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="text-sm font-medium">{order.user.email || 'N/A'}</p>
                              <p className="font-mono text-xs text-gray-500">
                                {order.user.wallets[0]?.accountId || '-'}
                              </p>
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="text-sm font-medium">{order.property.name}</p>
                              {order.property.hederaToken && (
                                <p className="font-mono text-xs text-blue-600">
                                  {order.property.hederaToken.tokenId}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-sm font-medium">
                            {order.tokenAmount.toLocaleString()}
                          </td>
                          <td className="py-4 text-sm font-medium">
                            ${Number(order.totalAmount).toLocaleString()}
                          </td>
                          <td className="py-4">{getStatusBadge(order.status)}</td>
                          <td className="py-4 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                              {order.paymentMemo}
                            </code>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
