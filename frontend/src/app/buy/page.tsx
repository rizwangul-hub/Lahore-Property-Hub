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
    purpose: 'SALE',
    basePath: '/buy',
    searchParams: params,
  });
}

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
