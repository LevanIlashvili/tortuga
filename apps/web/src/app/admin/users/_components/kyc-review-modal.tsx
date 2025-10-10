'use client';

import { useState } from 'react';
import { X, Check, XCircle, FileText } from 'lucide-react';

interface KycReviewModalProps {
  user: {
    id: string;
    email: string | null;
    kycApplication: {
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
      status: string;
    } | null;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function KycReviewModal({ user, onClose, onSuccess }: KycReviewModalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !user.kycApplication) {
    return null;
  }

  const handleReview = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT' && !note.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action,
          note: note.trim(),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to review KYC');
      }
    } catch (error) {
      console.error('KYC review failed:', error);
      alert('Failed to review KYC');
    } finally {
      setLoading(false);
    }
  };

  const kyc = user.kycApplication;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-xl font-bold">KYC Review</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">User Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm">{user.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="mt-1 text-sm">{kyc.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="mt-1 text-sm">
                  {new Date(kyc.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nationality</label>
                <p className="mt-1 text-sm">{kyc.nationality}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">Address</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-500">Street Address</label>
                <p className="mt-1 text-sm">{kyc.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">City</label>
                <p className="mt-1 text-sm">{kyc.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Postal Code</label>
                <p className="mt-1 text-sm">{kyc.postalCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Country</label>
                <p className="mt-1 text-sm">{kyc.country}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">Documents</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <a
                href={kyc.idDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border p-4 hover:bg-gray-50"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">ID Document</p>
                  <p className="text-xs text-gray-500">View document</p>
                </div>
              </a>
              <a
                href={kyc.proofOfAddressUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border p-4 hover:bg-gray-50"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Proof of Address</p>
                  <p className="text-xs text-gray-500">View document</p>
                </div>
              </a>
              {kyc.selfieUrl && (
                <a
                  href={kyc.selfieUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border p-4 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Selfie</p>
                    <p className="text-xs text-gray-500">View photo</p>
                  </div>
                </a>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Review Notes {kyc.status === 'PENDING' && '(Required for rejection)'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add notes about your decision..."
              disabled={loading || kyc.status !== 'PENDING'}
            />
          </div>

          {kyc.status === 'PENDING' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleReview('APPROVE')}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Approve KYC
              </button>
              <button
                onClick={() => handleReview('REJECT')}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject KYC
              </button>
            </div>
          )}

          {kyc.status !== 'PENDING' && (
            <div className="rounded-lg bg-gray-100 p-4 text-center">
              <p className="text-sm font-medium text-gray-700">
                This KYC application has already been {kyc.status.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
