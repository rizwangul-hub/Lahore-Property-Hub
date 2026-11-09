'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Filter,
  ArrowLeft,
  ChevronDown,
  ArrowUpDown,
  Home,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { PropertyCard } from '@/components/property/PropertyCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { SearchFiltersSidebar } from './SearchFiltersSidebar';
import { fetchProperties } from '@/lib/api';
import { PropertyListing, SearchFilters } from '@/types';

export interface SearchResultsViewProps {
  purpose: 'SALE' | 'RENT' | 'WANTED';
  baseTitle: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  purpose,
  baseTitle,
  breadcrumbs,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Read URL query parameters
  const area = searchParams.get('area') || '';
  const type = searchParams.get('type') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minAreaSize = searchParams.get('minAreaSize') || '';
  const maxAreaSize = searchParams.get('maxAreaSize') || '';
  const areaUnit = searchParams.get('areaUnit') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const bathrooms = searchParams.get('bathrooms') || '';
  const facilities = searchParams.get('facilities') || '';
  const keyword = searchParams.get('keyword') || '';
  const sort = (searchParams.get('sort') || 'newest') as SearchFilters['sort'];
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Fetch from MongoDB via API whenever query parameters change
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const filters: SearchFilters = {
          listingType: purpose,
          area: area !== 'lahore' ? area : undefined,
          propertyType: type !== 'all' ? type : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          minAreaSize: minAreaSize || undefined,
          maxAreaSize: maxAreaSize || undefined,
          bedrooms: bedrooms || undefined,
          bathrooms: bathrooms || undefined,
          facilities: facilities || undefined,
          keyword: keyword || undefined,
          sort,
          page: currentPage,
          limit: 12,
        };

        const res = await fetchProperties(filters);
        if (isMounted) {
          setProperties(res.properties);
          setTotalCount(res.total);
          setTotalPages(res.totalPages);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load properties');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [
    purpose,
    area,
    type,
    minPrice,
    maxPrice,
    minAreaSize,
    maxAreaSize,
    areaUnit,
    bedrooms,
    bathrooms,
    facilities,
    keyword,
    sort,
    currentPage,
  ]);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayArea = area ? area.replace(/-/g, ' ') : 'Lahore';

  return (
    <div className="py-8 sm:py-12 bg-navy-50/50 min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-navy-500">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              {bc.href ? (
                <Link href={bc.href} className="hover:text-brand-600 transition">
                  {bc.label}
                </Link>
              ) : (
                <span className="font-semibold text-navy-900">{bc.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Heading & Summary Bar */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-navy-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950 capitalize">
              {baseTitle} in {displayArea}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-navy-600">
              Showing <span className="font-bold text-navy-900">{totalCount}</span> verified approved{' '}
              {purpose === 'WANTED' ? 'requirements' : 'properties'} in Lahore
            </p>
          </div>

          {/* Top Controls: Mobile Filter Button & Sort Selector */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-xs font-bold text-navy-800 shadow-sm hover:bg-navy-50"
            >
              <SlidersHorizontal className="h-4 w-4 text-brand-600" />
              <span>Filters</span>
            </button>

            <div className="relative">
              <div className="flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-navy-800 shadow-sm focus-within:border-brand-500">
                <ArrowUpDown className="h-3.5 w-3.5 text-navy-400" />
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-transparent outline-none cursor-pointer"
                  aria-label="Sort properties"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="featured">Featured First</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-navy-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Search Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <SearchFiltersSidebar currentPurpose={purpose} />
          </div>

          {/* Mobile Filter Modal / Drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex bg-navy-950/60 backdrop-blur-sm lg:hidden">
              <div className="relative ml-auto h-full w-full max-w-sm overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-right">
                <SearchFiltersSidebar
                  currentPurpose={purpose}
                  isMobileModal
                  onCloseMobile={() => setMobileFilterOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Results Area */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <LoadingState count={6} />
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
                <h3 className="font-bold text-sm">Failed to retrieve search results</h3>
                <p className="mt-1 text-xs">{error}</p>
              </div>
            ) : properties.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 border-t border-navy-200 pt-8">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="inline-flex items-center gap-1 rounded-xl border border-navy-200 bg-white py-2 px-3 text-xs font-bold text-navy-800 disabled:opacity-40 hover:bg-navy-50 transition"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                              pageNum === currentPage
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="inline-flex items-center gap-1 rounded-xl border border-navy-200 bg-white py-2 px-3 text-xs font-bold text-navy-800 disabled:opacity-40 hover:bg-navy-50 transition"
                      aria-label="Next Page"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={Home}
                title="No matching properties found"
                description={`We could not find any approved ${purpose.toLowerCase()} properties matching your current criteria in ${displayArea}. Try broadening your price range, removing filters, or submit a new property.`}
                actionText="Post Your Property"
                actionHref="/post-property"
              />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
