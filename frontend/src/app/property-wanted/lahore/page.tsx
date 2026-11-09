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
    purpose: 'WANTED',
    basePath: '/property-wanted/lahore',
    searchParams: params,
  });
}

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
