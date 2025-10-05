'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/app/_components/auth-provider';

export default function KYCPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [existingKyc, setExistingKyc] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    checkExistingKyc();
  }, [user]);

  const checkExistingKyc = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/kyc/status');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.application) {
          setExistingKyc(data.application);
        }
      }
    } catch (err) {
      console.error('Failed to check KYC status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200 mb-4" />
            <div className="h-4 w-96 rounded bg-gray-200 mb-8" />
            <div className="h-96 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (existingKyc) {
    const getStatusDisplay = () => {
      switch (existingKyc.status) {
        case 'PENDING':
          return {
            icon: <Clock className="h-12 w-12 text-yellow-600" />,
            title: 'KYC Under Review',
            description: 'Your KYC application is being reviewed. You will be notified once the review is complete.',
            badge: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>,
          };
        case 'APPROVED':
          return {
            icon: <CheckCircle2 className="h-12 w-12 text-green-600" />,
            title: 'KYC Approved',
            description: 'Your identity has been verified. You can now invest in properties.',
            badge: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>,
          };
        case 'REJECTED':
          return {
            icon: <XCircle className="h-12 w-12 text-red-600" />,
            title: 'KYC Rejected',
            description: existingKyc.rejectionReason || 'Your KYC application was rejected. Please contact support for more information.',
            badge: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>,
          };
        default:
          return {
            icon: <Clock className="h-12 w-12 text-gray-600" />,
            title: 'KYC Status Unknown',
            description: 'Please contact support for assistance.',
            badge: <Badge variant="outline">Unknown</Badge>,
          };
      }
    };

    const statusDisplay = getStatusDisplay();

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <Card>
            <CardContent className="pt-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{statusDisplay.icon}</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{statusDisplay.title}</h1>
                <p className="text-gray-600 mb-4 max-w-md">{statusDisplay.description}</p>
                {statusDisplay.badge}
                {existingKyc.status === 'APPROVED' && (
                  <button
                    onClick={() => router.push('/properties')}
                    className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Browse Properties
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Personal Information', description: 'Basic details and address' },
    { number: 2, title: 'Document Upload', description: 'ID verification' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
          <p className="mt-2 text-gray-600">
            Complete your identity verification to start investing in real estate
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep >= step.number
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-full mx-4 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="text-center py-8 text-gray-500">
                Personal Information Form (Coming in next commit)
              </div>
            )}
            {currentStep === 2 && (
              <div className="text-center py-8 text-gray-500">
                Document Upload Form (Coming soon)
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
