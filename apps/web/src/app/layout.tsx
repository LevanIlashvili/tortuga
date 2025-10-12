import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AuthProviderWrapper } from './_components/auth-provider-wrapper';
import { LayoutWrapper } from './_components/layout-wrapper';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tortuga - Real Estate Tokenization on Hedera',
  description: 'Tokenize real estate bonds with Hedera Token Service and Hedera Consensus Service for immutable compliance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <AuthProviderWrapper>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
