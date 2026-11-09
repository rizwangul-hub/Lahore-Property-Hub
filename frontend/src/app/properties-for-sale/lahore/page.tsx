import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Properties for Sale in Lahore | Lahore Property Hub',
  description:
    'Browse houses, plots, apartments, and commercial properties for sale in Lahore. Explore DHA, Bahria Town, Gulberg, Johar Town, and all prime sectors.',
  alternates: {
    canonical: `${siteConfig.url}/properties-for-sale/lahore`,
  },
};

export default function PropertiesForSalePage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-navy-500">Loading properties for sale...</div>}>
      <SearchResultsView
        purpose="SALE"
        baseTitle="Properties for Sale"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Properties for Sale', href: '/properties-for-sale/lahore' },
        ]}
      />
    </Suspense>
  );
}
