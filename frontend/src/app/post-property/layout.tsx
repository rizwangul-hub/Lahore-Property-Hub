import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post Free Property Advertisement | Property in Lahore',
  description: 'Submit your residential, commercial, or wanted property advertisement in Lahore with direct WhatsApp inquiries.',
  alternates: {
    canonical: 'https://www.propertyinlahore.online/post-property',
  },
  openGraph: {
    title: 'Post Free Property Advertisement in Lahore | Property in Lahore',
    description: 'List your house, plot, flat, or commercial space in Lahore for free. Connect with verified buyers and tenants directly.',
    url: 'https://www.propertyinlahore.online/post-property',
    siteName: 'Property in Lahore',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PostPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
