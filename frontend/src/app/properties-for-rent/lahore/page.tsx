import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Properties for Rent in Lahore | Lahore Property Hub',
  description:
    'Find houses, apartments, shops, and offices for rent in Lahore. Connect directly with verified owners and realtors across Bahria Town, DHA, and Gulberg.',
  alternates: {
    canonical: `${siteConfig.url}/properties-for-rent/lahore`,
  },
};

export default function PropertiesForRentPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-navy-500">Loading properties for rent...</div>}>
      <SearchResultsView
        purpose="RENT"
        baseTitle="Properties for Rent"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Properties for Rent', href: '/properties-for-rent/lahore' },
        ]}
      />
    </Suspense>
  );
}
