import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Header } from './_components/header';
import { Footer } from './_components/footer';
import { AuthProviderWrapper } from './_components/auth-provider-wrapper';

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
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
