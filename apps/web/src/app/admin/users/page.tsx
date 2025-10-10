'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, UserX, Clock, Eye } from 'lucide-react';
import { KycReviewModal } from './_components/kyc-review-modal';

interface User {
  id: string;
  email: string | null;
  role: string;
  createdAt: string;
  isActive: boolean;
  kycApplication: {
    status: string;
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    idDocumentUrl: string;
    proofOfAddressUrl: string;
    selfieUrl: string | null;
  } | null;
  wallets: Array<{
    accountId: string;
  }>;
  _count: {
    orders: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [search, kycFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (kycFilter) params.append('kycStatus', kycFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKycBadge = (status: string | null) => {
    if (!status) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          <Clock className="h-3 w-3" />
          No KYC
        </span>
      );
    }

    const badges: Record<string, { icon: any; color: string; bg: string }> = {
      APPROVED: { icon: UserCheck, color: 'text-green-700', bg: 'bg-green-50' },
      PENDING: { icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-50' },
      REJECTED: { icon: UserX, color: 'text-red-700', bg: 'bg-red-50' },
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
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="mt-2 text-gray-600">Manage platform users and KYC status</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All KYC Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="h-64 animate-pulse rounded bg-gray-200" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-500">
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Wallet</th>
                    <th className="pb-3">KYC Status</th>
                    <th className="pb-3">Orders</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Joined</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-sm text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-4 text-sm font-medium">{user.email || 'N/A'}</td>
                        <td className="py-4 text-sm text-gray-600">
                          {user.kycApplication?.fullName || '-'}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {user.wallets[0]?.accountId || '-'}
                        </td>
                        <td className="py-4">{getKycBadge(user.kycApplication?.status || null)}</td>
                        <td className="py-4 text-sm text-gray-600">{user._count.orders}</td>
                        <td className="py-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          {user.kycApplication && (
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                            >
                              <Eye className="h-3 w-3" />
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedUser && (
        <KycReviewModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            fetchUsers();
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
