import { CheckCircle, Wallet, FileCheck, Coins } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Wallet,
      title: 'Connect Your Wallet',
      description: 'Connect your HashPack wallet to get started. No email or password required.',
    },
    {
      icon: FileCheck,
      title: 'Complete KYC',
      description: 'Verify your identity to comply with regulatory requirements.',
    },
    {
      icon: Coins,
      title: 'Invest in Properties',
      description: 'Browse available properties and purchase fractional ownership tokens.',
    },
    {
      icon: CheckCircle,
      title: 'Earn Returns',
      description: 'Receive rental income and appreciation directly to your wallet.',
    },
  ];

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start investing in real estate in just four simple steps
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
