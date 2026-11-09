import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Buy Property in Lahore | Lahore Property Hub',
  description:
    'Find houses, plots, flats, and commercial properties for purchase in Lahore. Filter by society, price, and specifications.',
  alternates: {
    canonical: `${siteConfig.url}/buy`,
  },
};

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-navy-500">Loading properties for purchase...</div>}>
      <SearchResultsView
        purpose="SALE"
        baseTitle="Properties for Purchase"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Buy Properties', href: '/buy' },
        ]}
      />
    </Suspense>
  );
}
