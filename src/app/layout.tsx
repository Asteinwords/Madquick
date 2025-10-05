import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Password Vault MVP',
  description: 'Secure password generator and vault',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-black dark:text-white`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 'bold',
            },
            success: {
              style: {
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              },
            },
            error: {
              style: {
                background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
              },
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}