import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { generateDynamicSearchMetadata } from '@/lib/seoHelper';

interface PageProps {
  searchParams: Promise<{
    area?: string;
    type?: string;
    society?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return generateDynamicSearchMetadata({
    purpose: 'RENT',
    basePath: '/rent',
    searchParams: params,
  });
}

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
