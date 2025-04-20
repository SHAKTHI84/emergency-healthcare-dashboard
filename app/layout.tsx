import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './client-layout';
import { Inter } from 'next/font/google';
import DatabaseInitializer from '../components/DatabaseInitializer';
import ErrorBoundary from '../components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

// Export metadata as a server component
export const metadata: Metadata = {
  title: 'Emergency Healthcare Dashboard',
  description: 'A comprehensive healthcare management system',
};

// Main layout component (server component)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DatabaseInitializer />
        <ErrorBoundary />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
