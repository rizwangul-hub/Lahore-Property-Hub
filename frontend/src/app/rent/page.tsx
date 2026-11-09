import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Rent Property in Lahore | Lahore Property Hub',
  description:
    'Find houses, apartments, shops, and offices for rent across Lahore. Connect directly with verified owners on WhatsApp.',
  alternates: {
    canonical: `${siteConfig.url}/rent`,
  },
};

export default function RentPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-navy-500">Loading rental properties...</div>}>
      <SearchResultsView
        purpose="RENT"
        baseTitle="Rental Properties"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Rent Properties', href: '/rent' },
        ]}
      />
    </Suspense>
  );
}
