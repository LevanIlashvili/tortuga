'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Filter, Loader2, FileText, ExternalLink } from 'lucide-react';

interface AuditEntry {
  consensusTimestamp: string;
  eventType: string;
  data: any;
  actor: string;
  transactionId: string;
}

export default function CompliancePage() {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchAuditTrail();
  }, [eventTypeFilter, limit]);

  const fetchAuditTrail = async () => {
    try {
      const params = new URLSearchParams();
      if (eventTypeFilter) params.append('eventType', eventTypeFilter);
      params.append('limit', String(limit));

      const response = await fetch(`/api/admin/compliance/audit-trail?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAuditTrail(data.auditTrail);
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Event Type', 'Actor', 'Transaction ID', 'Details'];
    const rows = auditTrail.map((entry) => [
      new Date(entry.consensusTimestamp).toISOString(),
      entry.eventType,
      entry.actor,
      entry.transactionId,
      JSON.stringify(entry.data),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-audit-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventTypeBadge = (eventType: string) => {
    const colors: Record<string, string> = {
      TOKEN_DEPLOYED: 'bg-purple-100 text-purple-800',
      PROPERTY_CREATED: 'bg-blue-100 text-blue-800',
      PROPERTY_UPDATED: 'bg-indigo-100 text-indigo-800',
      PROPERTY_DELETED: 'bg-red-100 text-red-800',
      KYC_APPROVED: 'bg-green-100 text-green-800',
      KYC_REJECTED: 'bg-red-100 text-red-800',
      ORDER_CREATED: 'bg-yellow-100 text-yellow-800',
      ORDER_PAID: 'bg-blue-100 text-blue-800',
      ORDER_COMPLETED: 'bg-green-100 text-green-800',
      TOKENS_MINTED: 'bg-purple-100 text-purple-800',
    };

    const color = colors[eventType] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${color}`}>
        {eventType}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Compliance Audit Trail</h1>
        <p className="mt-2 text-gray-600">
          Immutable audit log stored on Hedera Consensus Service (HCS)
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Event Types</option>
            <option value="TOKEN_DEPLOYED">Token Deployed</option>
            <option value="PROPERTY_CREATED">Property Created</option>
            <option value="PROPERTY_UPDATED">Property Updated</option>
            <option value="PROPERTY_DELETED">Property Deleted</option>
            <option value="KYC_APPROVED">KYC Approved</option>
            <option value="KYC_REJECTED">KYC Rejected</option>
            <option value="ORDER_CREATED">Order Created</option>
            <option value="ORDER_PAID">Order Paid</option>
            <option value="ORDER_COMPLETED">Order Completed</option>
            <option value="TOKENS_MINTED">Tokens Minted</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Limit:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>

        <button
          onClick={exportToCSV}
          disabled={auditTrail.length === 0}
          className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit Events ({auditTrail.length})</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>Stored on HCS Topic</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-500">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Event Type</th>
                    <th className="pb-3">Actor</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {auditTrail.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                        No audit entries found
                      </td>
                    </tr>
                  ) : (
                    auditTrail.map((entry, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-4">
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(entry.consensusTimestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.consensusTimestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">{getEventTypeBadge(entry.eventType)}</td>
                        <td className="py-4">
                          <p className="font-mono text-xs text-gray-600">
                            {entry.actor.slice(0, 12)}...
                          </p>
                        </td>
                        <td className="py-4">
                          <details className="cursor-pointer">
                            <summary className="text-sm text-blue-600 hover:text-blue-800">
                              View Details
                            </summary>
                            <pre className="mt-2 max-w-md overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                              {JSON.stringify(entry.data, null, 2)}
                            </pre>
                          </details>
                        </td>
                        <td className="py-4">
                          <a
                            href={`https://hashscan.io/mainnet/transaction/${entry.transactionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-xs text-blue-600 hover:text-blue-800"
                          >
                            {entry.transactionId.slice(0, 15)}...
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {auditTrail.length > 0 && (
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Immutable Audit Trail</p>
                    <p className="mt-1 text-blue-700">
                      All compliance events are permanently recorded on the Hedera Consensus
                      Service, ensuring tamper-proof audit logs for regulatory compliance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
