import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ShopProvider } from '@/context/ShopContext';
import { AdminShortcut } from '@/components/AdminShortcut';

export const viewport: Viewport = {
  themeColor: '#fcf8f1',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MACCY COLLECTIONS | African Luxury Fashion, Footwear & Bespoke Tailoring | Narok, Kenya',
  description: 'MACCY COLLECTIONS is a woman-owned Kenyan fashion and lifestyle enterprise located at Total Petrol Station, near Maasai Mara University junction. Discover bespoke tailoring, men\'s apparel, artisanal footwear, and authentic curio.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MACCY Collections'
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..800&family=Playfair+Display:ital,wght@0,400..700;1,400..700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#fcf8f1] text-[#2a2629] selection:bg-[#6b1429] selection:text-white">
        <ShopProvider>
          <AdminShortcut />
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
