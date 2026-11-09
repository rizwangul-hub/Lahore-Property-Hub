import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Property Wanted Requirements | Lahore Property Hub',
  description:
    'Browse active buyer and tenant property demands in Lahore. Connect with verified buyers looking for plots and houses.',
  alternates: {
    canonical: `${siteConfig.url}/wanted`,
  },
};

export default function WantedPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-navy-500">Loading wanted requirements...</div>}>
      <SearchResultsView
        purpose="WANTED"
        baseTitle="Property Wanted Requirements"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Property Wanted', href: '/wanted' },
        ]}
      />
    </Suspense>
  );
}
