// File:src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'KAWAN DIABETES - RS Pantinugroho',
  description: 'Sistem manajemen perawatan diabetes terintegrasi untuk RS Pantinugroho',
  keywords: 'diabetes, hospital, healthcare, patient management, RS Pantinugroho',
  authors: [{ name: 'RS Pantinugroho IT Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${poppins.variable}`}>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}