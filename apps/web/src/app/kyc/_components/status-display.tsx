'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KycApplication {
  id: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface StatusDisplayProps {
  application: KycApplication;
}

export function StatusDisplay({ application }: StatusDisplayProps) {
  const router = useRouter();

  const getStatusConfig = () => {
    switch (application.status) {
      case 'PENDING':
        return {
          icon: <Clock className="h-12 w-12 text-yellow-600" />,
          title: 'KYC Under Review',
          description: 'Your KYC application is being reviewed by our compliance team. This typically takes 1-2 business days. You will be notified via email once the review is complete.',
          badge: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'APPROVED':
        return {
          icon: <CheckCircle2 className="h-12 w-12 text-green-600" />,
          title: 'KYC Approved',
          description: 'Your identity has been successfully verified. You can now invest in properties and access all platform features.',
          badge: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="h-12 w-12 text-red-600" />,
          title: 'KYC Rejected',
          description: application.rejectionReason || 'Your KYC application was rejected. Please review the information below and resubmit your application with updated documents.',
          badge: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: <Clock className="h-12 w-12 text-gray-600" />,
          title: 'KYC Status Unknown',
          description: 'Unable to determine your KYC status. Please contact support for assistance.',
          badge: <Badge variant="outline">Unknown</Badge>,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{config.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h2>
          <div className="mb-4">{config.badge}</div>
          <p className="text-gray-700 max-w-md">{config.description}</p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Application ID</div>
              <div className="mt-1 font-mono text-sm text-gray-900">{application.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Submitted</div>
              <div className="mt-1 text-sm text-gray-900">{formatDate(application.submittedAt)}</div>
            </div>
            {application.reviewedAt && (
              <div>
                <div className="text-sm text-gray-600">Reviewed</div>
                <div className="mt-1 text-sm text-gray-900">{formatDate(application.reviewedAt)}</div>
              </div>
            )}
          </div>
        </div>

        {application.status === 'REJECTED' && application.rejectionReason && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm font-semibold text-gray-900 mb-2">Rejection Reason</div>
            <p className="text-sm text-gray-700">{application.rejectionReason}</p>
          </div>
        )}
      </div>

      {application.status === 'APPROVED' && (
        <div className="flex justify-center">
          <Button size="lg" onClick={() => router.push('/properties')}>
            Browse Properties
          </Button>
        </div>
      )}

      {application.status === 'REJECTED' && (
        <div className="flex justify-center">
          <Button size="lg" onClick={() => router.push('/kyc/resubmit')}>
            Resubmit Application
          </Button>
        </div>
      )}
    </div>
  );
}
