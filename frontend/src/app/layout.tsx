import type { Metadata, Viewport } from 'next';
import './globals.css';
import { siteConfig } from '@/config/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  manifest: '/manifest.webmanifest',
  title: {
    default: `${siteConfig.name} | Premier Real Estate Marketplace in Lahore`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Lahore Property',
    'Real Estate Lahore',
    'DHA Lahore houses for sale',
    'Bahria Town Lahore rent',
    'Gulberg commercial properties',
    'Pakistan property marketplace',
    'Buy rent property Lahore',
  ],
  authors: [{ name: siteConfig.brandName }],
  creator: siteConfig.brandName,
  publisher: siteConfig.brandName,
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: siteConfig.url,
    title: `${siteConfig.name} | Premier Real Estate Marketplace in Lahore`,
    description: siteConfig.description,
    siteName: siteConfig.brandName,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Premier Real Estate Marketplace in Lahore`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.brandName,
    statusBarStyle: 'default',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'nOxhVYb-_2WzWnW58lL45gumDyJ8O4R6sHZ_eumO4uE',
  },
};

export const viewport: Viewport = {
  themeColor: '#061A3A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="google-site-verification" content="nOxhVYb-_2WzWnW58lL45gumDyJ8O4R6sHZ_eumO4uE" />
      </head>
      <body className="flex min-h-screen flex-col bg-navy-50 text-navy-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <LoadingScreen />
      </body>
    </html>
  );
}
