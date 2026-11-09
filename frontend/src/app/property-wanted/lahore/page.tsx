import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Property Wanted in Lahore | Lahore Property Hub',
  description:
    'Explore buyer and tenant property requests in Lahore. Discover specific demands for plots, houses, and commercial buildings.',
  alternates: {
    canonical: `${siteConfig.url}/property-wanted/lahore`,
  },
};

export default function PropertyWantedPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-navy-500">Loading property wanted...</div>}>
      <SearchResultsView
        purpose="WANTED"
        baseTitle="Property Wanted Requirements"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Property Wanted', href: '/property-wanted/lahore' },
        ]}
      />
    </Suspense>
  );
}
